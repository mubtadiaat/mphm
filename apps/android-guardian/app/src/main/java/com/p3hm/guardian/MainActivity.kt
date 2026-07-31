package com.p3hm.guardian

import com.mubtadiaat.guardian.R
import android.app.DownloadManager
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.view.View
import android.webkit.*
import android.widget.ProgressBar
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import org.json.JSONObject

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar
    private lateinit var swipeRefreshLayout: SwipeRefreshLayout
    private lateinit var googleSignInClient: GoogleSignInClient

    private val targetUrl = "https://m.p3hm.my.id/loginguardiant"

    private var filePathCallback: ValueCallback<Array<Uri>>? = null
    private var cameraImageUri: Uri? = null
    private val androidBridge = AndroidBridge()

    private val googleSignInLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        val task = GoogleSignIn.getSignedInAccountFromIntent(result.data)
        try {
            val account = task.getResult(ApiException::class.java)
            val email = account?.email ?: ""
            val idToken = account?.idToken ?: ""
            val displayName = account?.displayName ?: ""

            if (email.isNotEmpty()) {
                Toast.makeText(this, "Login Google: $email", Toast.LENGTH_SHORT).show()
                val safeEmail = JSONObject.quote(email)
                val safeIdToken = JSONObject.quote(idToken)
                val safeDisplayName = JSONObject.quote(displayName)

                val jsCode = """
                    (function() {
                        if (typeof window.handleNativeGoogleSignIn === 'function') {
                            window.handleNativeGoogleSignIn($safeEmail, $safeIdToken, $safeDisplayName);
                        } else {
                            window.location.href = 'https://m.p3hm.my.id/auth/google/callback?email=' + encodeURIComponent($safeEmail);
                        }
                    })();
                """.trimIndent()
                webView.evaluateJavascript(jsCode, null)
                CookieManager.getInstance().flush()
            }
        } catch (e: ApiException) {
            if (e.statusCode != 12501) { // 12501: User cancelled sign-in dialog
                Toast.makeText(this, "Gagal login Google (${e.statusCode})", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private val filePickerLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (filePathCallback == null) return@registerForActivityResult

        var results: Array<Uri>? = null
        if (result.resultCode == RESULT_OK) {
            val data = result.data
            if (data != null && data.data != null) {
                results = arrayOf(data.data!!)
            } else if (cameraImageUri != null) {
                results = arrayOf(cameraImageUri!!)
            }
        }
        filePathCallback?.onReceiveValue(results)
        filePathCallback = null
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)
        progressBar = findViewById(R.id.progressBar)
        swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout)

        setupGoogleSignIn()
        setupWebView()
        setupDownloadManagerListener()
        setupPhysicalBackButton()

        swipeRefreshLayout.setColorSchemeColors(android.graphics.Color.parseColor("#10b981"))
        swipeRefreshLayout.setOnRefreshListener {
            webView.reload()
        }

        if (savedInstanceState == null) {
            webView.loadUrl(targetUrl)
        } else {
            webView.restoreState(savedInstanceState)
        }

        // Trigger background in-app update check
        AppUpdateManager.checkForUpdates(this)
    }

    private fun setupGoogleSignIn() {
        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestEmail()
            .build()
        googleSignInClient = GoogleSignIn.getClient(this, gso)
    }

    fun launchNativeGoogleSignIn() {
        googleSignInClient.signOut().addOnCompleteListener {
            val signInIntent = googleSignInClient.signInIntent
            googleSignInLauncher.launch(signInIntent)
        }
    }

    private fun setupWebView() {
        val webSettings = webView.settings
        webSettings.javaScriptEnabled = true
        webSettings.domStorageEnabled = true
        webSettings.databaseEnabled = true
        webSettings.allowFileAccess = true
        webSettings.allowContentAccess = true

        // Cache & Performance Settings
        webSettings.cacheMode = WebSettings.LOAD_DEFAULT
        webSettings.useWideViewPort = true
        webSettings.loadWithOverviewMode = true

        // Persistent Session Cookies
        val cookieManager = CookieManager.getInstance()
        cookieManager.setAcceptCookie(true)
        cookieManager.setAcceptThirdPartyCookies(webView, true)

        // Javascript Interface Bridge for Web App (Reusing single instance)
        webView.addJavascriptInterface(androidBridge, "AndroidBridge")
        webView.addJavascriptInterface(androidBridge, "Android")

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url?.toString() ?: return false

                // Intercept Google Sign-In / OAuth to launch native Android Account Chooser bottom-sheet
                if (url.contains("accounts.google.com") || url.contains("google.com/o/oauth2") || url.contains("google.com/gsi")) {
                    runOnUiThread {
                        launchNativeGoogleSignIn()
                    }
                    return true
                }

                // SSL & Domain Security Enforcement
                if (url.startsWith("https://m.p3hm.my.id")) {
                    return false
                }

                // Handle external links or intent actions (e.g., WhatsApp / Call)
                return try {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                    startActivity(intent)
                    true
                } catch (e: Exception) {
                    false
                }
            }

            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                progressBar.visibility = View.VISIBLE
                progressBar.progress = 10
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                progressBar.visibility = View.GONE
                swipeRefreshLayout.isRefreshing = false
                CookieManager.getInstance().flush()
            }

            override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
                super.onReceivedError(view, request, error)
                swipeRefreshLayout.isRefreshing = false
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                progressBar.progress = newProgress
                if (newProgress == 100) {
                    progressBar.visibility = View.GONE
                }
            }

            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                this@MainActivity.filePathCallback?.onReceiveValue(null)
                this@MainActivity.filePathCallback = filePathCallback

                val contentSelectionIntent = Intent(Intent.ACTION_GET_CONTENT).apply {
                    addCategory(Intent.CATEGORY_OPENABLE)
                    type = "*/*"
                }

                val chooserIntent = Intent(Intent.ACTION_CHOOSER).apply {
                    putExtra(Intent.EXTRA_INTENT, contentSelectionIntent)
                    putExtra(Intent.EXTRA_TITLE, "Pilih File / Dokumen")
                }

                filePickerLauncher.launch(chooserIntent)
                return true
            }
        }
    }

    inner class AndroidBridge {
        @JavascriptInterface
        fun promptGoogleSignIn() {
            runOnUiThread {
                launchNativeGoogleSignIn()
            }
        }

        @JavascriptInterface
        fun isNativeApp(): Boolean {
            return true
        }
    }

    /**
     * DownloadManager integration for PDF invoices, payment receipts, and report cards (rapor).
     */
    private fun setupDownloadManagerListener() {
        webView.setDownloadListener { url, userAgent, contentDisposition, mimeType, contentLength ->
            try {
                val request = DownloadManager.Request(Uri.parse(url))
                
                val filename = URLUtil.guessFileName(url, contentDisposition, mimeType)
                val cookies = CookieManager.getInstance().getCookie(url)

                request.setMimeType(mimeType)
                request.addRequestHeader("cookie", cookies)
                request.addRequestHeader("User-Agent", userAgent)
                
                request.setDescription("Mengunduh dokumen PDF e-mubtadi'aat...")
                request.setTitle(filename)

                if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
                    @Suppress("DEPRECATION")
                    request.allowScanningByMediaScanner()
                }
                request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, filename)

                val downloadManager = getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
                downloadManager.enqueue(request)

                Toast.makeText(
                    applicationContext,
                    "Mengunduh file: $filename",
                    Toast.LENGTH_LONG
                ).show()
            } catch (e: Exception) {
                Toast.makeText(
                    applicationContext,
                    "Gagal mengunduh file: ${e.localizedMessage}",
                    Toast.LENGTH_SHORT
                ).show()
            }
        }
    }

    /**
     * Physical back button handling to navigate webView.goBack() before closing app.
     */
    private fun setupPhysicalBackButton() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    finish()
                }
            }
        })
    }

    override fun onPause() {
        super.onPause()
        CookieManager.getInstance().flush()
    }

    override fun onStop() {
        super.onStop()
        CookieManager.getInstance().flush()
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        webView.saveState(outState)
    }
}
