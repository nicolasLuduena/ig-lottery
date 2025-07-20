import { NextResponse } from "next/server";

export const config = {
  runtime: "edge",
};

async function handler(req: Request) {
  const url = new URL(req.url, "http://localhost:3000");
  const imageUrl = url.searchParams.get("url");

  if (!imageUrl) {
    return new NextResponse("Missing URL", { status: 400 });
  }

  try {
    const res = await fetch(imageUrl);
    const contentType = res.headers.get("content-type") || "image/jpeg";
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400", // cache for 1 day
      },
    });
  } catch (err) {
    return new NextResponse("Failed to fetch image", { status: 500 });
  }
}

export default handler;
