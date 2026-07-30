import Groq from "groq-sdk";

export const runtime = "edge";

if (!process.env.GROQ_API_KEY) {
  console.warn("PERINGATAN: GROQ_API_KEY belum diatur di environment!");
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY || "",
});

const P3HM_KNOWLEDGE_SYSTEM_PROMPT = {
  role: "system",
  content: `Anda adalah Asisten Virtual Resmi (AI Bantuan) untuk Pondok Pesantren & Madrasah Putri Hidayatul Mubtadi'aat (P3HM & MPHM) Lirboyo Kediri.

Tugas Utama Anda:
1. Membantu dan menjawab seluruh pertanyaan masyarakat, pengurus, guru, dan wali santri terkait Pesantren & Madrasah Putri Hidayatul Mubtadi'aat Lirboyo Kediri.
2. Membantu memberikan petunjuk penggunaan dan cara mengunduh Software & Aplikasi resmi MPHM:
   - **Software Admin Desktop (.exe)**: Khusus Pengurus Sekretariat Pondok & Sekretariat Madrasah (dibuka melalui Windows PC/Laptop).
   - **App Staff & Pengurus (.apk)**: Khusus Mustahiq, Mufattisy, Mundzir, Musyrifah, dan Pengurus (untuk absensi, nilai raport, perizinan).
   - **App Wali Santri (.apk)**: Khusus Orang Tua / Wali Santri untuk memantau perkembangan anak, nilai raport, presensi, & catatan kedisiplinan secara gratis & realtime.

Aturan Pelayanan:
1. Bersikaplah sangat sopan, ramah, islami, profesional, dan membantu (Gunakan sapaan islami seperti Assalamu'alaikum, Kang/Mbak, Bapak/Ibu, Wali Santri).
2. Jika ada yang menanyakan tentang cara login:
   - Login Software Admin Desktop & Aplikasi Staff khusud Pengurus yang sudah diberi akses.
   - Login Aplikasi Wali Santri dapat menggunakan Google One-Tap atau akun wali yang terdaftar.
3. Jawab pertanyaan dengan ringkas, jelas, dan mudah dipahami.
4. Gunakan bahasa Indonesia yang baik dan santun.`,
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Format "messages" harus berupa array' }), { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "Kunci API Groq belum terpasang. Silakan atur GROQ_API_KEY di environment server.",
        }),
        { status: 500 }
      );
    }

    const completion = await groq.chat.completions.create({
      messages: [P3HM_KNOWLEDGE_SYSTEM_PROMPT, ...messages],
      model: "llama-3.3-70b-versatile",
      temperature: 0.6,
      max_tokens: 2048,
      stream: true,
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(new TextEncoder().encode(content));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error: any) {
    console.error("Groq API Error:", error?.message || error);
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan pada layanan AI Bantuan P3HM." }),
      { status: 500 }
    );
  }
}
