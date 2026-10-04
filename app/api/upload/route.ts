import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "l7fcd6zd",
  api_key: "358597696252125",
  api_secret: "3UZlAHm4IGPTuHjjlRJBEabvNr0",
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file was received by the server" }, { status: 400 });
    }

    // Convert the file into a Node.js Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Stream the buffer directly to Cloudinary using auto resource detection
    const result: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "nutrimed_investigations",
          resource_type: "auto", // Automatically detects PDF vs Image correctly from buffer bytes
          public_id: file.name ? file.name.replace(/\.[^/.]+$/, "") : undefined, // Keeps original filename if possible
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (error: any) {
    console.error("Upload API Error:", error); 
    return NextResponse.json(
      { error: error.message || "Cloudinary rejected the upload stream" }, 
      { status: 500 }
    );
  }
}