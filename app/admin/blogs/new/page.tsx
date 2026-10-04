"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Removed 'storage' import
import RoleGuard from "@/components/auth/RoleGuard";
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Edit3, 
  Image as ImageIcon, 
  Upload, 
  CheckCircle2, 
  Loader2, 
  Trash2, 
  X 
} from "lucide-react";
import Link from "next/link";

export default function NewBlogPage() {
  const router = useRouter();
  const pathname = usePathname();

  // Dynamically determine base path depending on who is accessing the page
  const isDoctorMode = pathname?.includes("/doctor");
  const basePath = isDoctorMode ? "/doctor" : "/admin";

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");

  const [imageUrl1, setImageUrl1] = useState("");
  const [imagePos1, setImagePos1] = useState("top");
  const [uploading1, setUploading1] = useState(false);

  const [imageUrl2, setImageUrl2] = useState("");
  const [imagePos2, setImagePos2] = useState("middle");
  const [uploading2, setUploading2] = useState(false);

  const [isPreview, setIsPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handler to upload image to Cloudinary
  const handleImageUpload = async (file: File, imageNumber: 1 | 2) => {
    if (!file) return;
    try {
      if (imageNumber === 1) setUploading1(true);
      else setUploading2(true);
      setError("");

      // ⚠️ REPLACE THESE TWO VALUES WITH YOUR CLOUDINARY CREDENTIALS ⚠️
      const CLOUD_NAME = "YOUR_CLOUD_NAME"; 
      const UPLOAD_PRESET = "YOUR_UPLOAD_PRESET_NAME"; 

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error?.message || "Cloudinary upload failed.");
      }

      const downloadUrl = data.secure_url;

      if (imageNumber === 1) setImageUrl1(downloadUrl);
      else setImageUrl2(downloadUrl);
    } catch (err: unknown) {
      console.error("Upload error:", err);
      const msg = err instanceof Error ? err.message : "Check your network or Cloudinary configuration.";
      setError(`Image Upload Failed: ${msg}`);
    } finally {
      if (imageNumber === 1) setUploading1(false);
      else setUploading2(false);
    }
  };

  // Handler for paste events
  const handlePaste = (e: React.ClipboardEvent, imageNumber: 1 | 2) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          handleImageUpload(file, imageNumber);
          break;
        }
      }
    }
  };

  // Handler for Drag & Drop
  const handleDrop = (e: React.DragEvent, imageNumber: 1 | 2) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        handleImageUpload(file, imageNumber);
      }
    }
  };

  const handleRemoveImage = (imageNumber: 1 | 2) => {
    if (imageNumber === 1) setImageUrl1("");
    else setImageUrl2("");
  };

  const handlePublish = async () => {
    if (!title.trim() || !content.trim() || !category.trim()) {
      setError("Please fill in the title, category, and article content.");
      setIsPreview(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      await addDoc(collection(db, "blogs"), {
        title: title.trim(),
        category: category.trim(),
        content,
        imageUrl1,
        imagePos1,
        imageUrl2,
        imagePos2,
        authorRole: isDoctorMode ? "doctor" : "admin",
        createdAt: serverTimestamp(),
      });

      router.push(`${basePath}/blogs`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save blog post.";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <RoleGuard allowedRoles={["admin", "doctor"]}>
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <Link
                href={`${basePath}/blogs`}
                className="inline-flex items-center gap-2 text-sm text-teal-700 font-semibold mb-2 hover:underline transition"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Articles
              </Link>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                {isPreview ? "Blog Preview Mode" : "Create New Blog Article"}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPreview(!isPreview)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition text-sm cursor-pointer"
              >
                {isPreview ? (
                  <>
                    <Edit3 className="w-4 h-4" /> Back to Editor
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" /> Preview Post
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePublish}
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2 bg-teal-700 text-white font-bold rounded-xl hover:bg-teal-800 transition text-sm shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {loading ? "Publishing..." : "Publish"}
              </button>
            </div>
          </div>

          {/* Form Editor View */}
          {!isPreview ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex justify-between items-center">
                  <span>{error}</span>
                  <button onClick={() => setError("")} className="text-red-500 hover:text-red-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Title Input */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Article Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Understanding Dietary Habits"
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-900"
                />
              </div>

              {/* Category Input */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Category *</label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Nutrition, Fitness, Diabetes Care..."
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-slate-900"
                />
              </div>

              {/* Image 1 Upload Box */}
              <div
                onPaste={(e) => handlePaste(e, 1)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, 1)}
                className="p-5 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl space-y-4 focus-within:border-teal-500 transition"
                tabIndex={0}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                    <ImageIcon className="w-4 h-4 text-teal-700" /> Image 1 (Upload, Drop, or Paste Ctrl+V)
                  </div>
                  <select
                    value={imagePos1}
                    onChange={(e) => setImagePos1(e.target.value)}
                    className="p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold outline-none text-slate-700"
                  >
                    <option value="top">Position: Top</option>
                    <option value="middle">Position: Middle</option>
                    <option value="bottom">Position: Bottom</option>
                  </select>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4">
                  <label className="w-full flex flex-col items-center justify-center p-4 bg-white border border-slate-300 rounded-xl cursor-pointer hover:bg-slate-100 transition">
                    {uploading1 ? (
                      <div className="flex items-center gap-2 text-teal-700 font-medium text-sm">
                        <Loader2 className="w-5 h-5 animate-spin" /> Uploading image...
                      </div>
                    ) : imageUrl1 ? (
                      <div className="flex items-center gap-2 text-emerald-600 font-medium text-sm">
                        <CheckCircle2 className="w-5 h-5" /> Image uploaded! Click to replace
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Upload className="w-5 h-5 text-teal-700" /> Click to browse, drop, or paste image
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleImageUpload(e.target.files[0], 1);
                          e.target.value = "";
                        }
                      }}
                    />
                  </label>

                  {imageUrl1 && (
                    <div className="relative group">
                      <img
                        src={imageUrl1}
                        alt="Preview 1"
                        className="w-20 h-20 object-cover rounded-lg border shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(1)}
                        className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full shadow hover:bg-red-700 transition"
                        title="Remove Image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Image 2 Upload Box */}
              <div
                onPaste={(e) => handlePaste(e, 2)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, 2)}
                className="p-5 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl space-y-4 focus-within:border-teal-500 transition"
                tabIndex={0}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                    <ImageIcon className="w-4 h-4 text-teal-700" /> Image 2 (Optional)
                  </div>
                  <select
                    value={imagePos2}
                    onChange={(e) => setImagePos2(e.target.value)}
                    className="p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold outline-none text-slate-700"
                  >
                    <option value="top">Position: Top</option>
                    <option value="middle">Position: Middle</option>
                    <option value="bottom">Position: Bottom</option>
                  </select>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4">
                  <label className="w-full flex flex-col items-center justify-center p-4 bg-white border border-slate-300 rounded-xl cursor-pointer hover:bg-slate-100 transition">
                    {uploading2 ? (
                      <div className="flex items-center gap-2 text-teal-700 font-medium text-sm">
                        <Loader2 className="w-5 h-5 animate-spin" /> Uploading image...
                      </div>
                    ) : imageUrl2 ? (
                      <div className="flex items-center gap-2 text-emerald-600 font-medium text-sm">
                        <CheckCircle2 className="w-5 h-5" /> Image uploaded! Click to replace
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Upload className="w-5 h-5 text-teal-700" /> Click to browse, drop, or paste image
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleImageUpload(e.target.files[0], 2);
                          e.target.value = "";
                        }
                      }}
                    />
                  </label>

                  {imageUrl2 && (
                    <div className="relative group">
                      <img
                        src={imageUrl2}
                        alt="Preview 2"
                        className="w-20 h-20 object-cover rounded-lg border shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(2)}
                        className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full shadow hover:bg-red-700 transition"
                        title="Remove Image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Article Content Textarea */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Article Content *</label>
                <textarea
                  required
                  rows={12}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your article text here..."
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none leading-relaxed text-slate-900"
                />
              </div>

              {/* Bottom Action Footer */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPreview(true)}
                  className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition text-sm"
                >
                  Preview Before Publishing
                </button>
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-teal-700 text-white font-bold rounded-xl hover:bg-teal-800 transition text-sm shadow-md disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {loading ? "Publishing..." : "Confirm & Publish Post"}
                </button>
              </div>
            </div>
          ) : (
            /* Preview Mode View */
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-12 space-y-8">
              <div className="border-b border-slate-100 pb-6">
                <span className="px-3 py-1 bg-teal-50 text-teal-700 font-bold rounded-full text-xs uppercase tracking-wider">
                  {category || "Uncategorized"}
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3">
                  {title || "Untitled Article"}
                </h1>
              </div>

              {/* Top Images */}
              {imageUrl1 && imagePos1 === "top" && (
                <div className="rounded-2xl overflow-hidden max-h-96 shadow-md">
                  <img src={imageUrl1} alt="Top 1" className="w-full object-cover" />
                </div>
              )}
              {imageUrl2 && imagePos2 === "top" && (
                <div className="rounded-2xl overflow-hidden max-h-96 shadow-md">
                  <img src={imageUrl2} alt="Top 2" className="w-full object-cover" />
                </div>
              )}

              {/* Article Text Content */}
              <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-4 whitespace-pre-line text-lg">
                {content || <p className="italic text-slate-400">No article content typed yet.</p>}

                {/* Middle Images */}
                {imageUrl1 && imagePos1 === "middle" && (
                  <div className="my-6 rounded-2xl overflow-hidden max-h-96 shadow-md">
                    <img src={imageUrl1} alt="Middle 1" className="w-full object-cover" />
                  </div>
                )}
                {imageUrl2 && imagePos2 === "middle" && (
                  <div className="my-6 rounded-2xl overflow-hidden max-h-96 shadow-md">
                    <img src={imageUrl2} alt="Middle 2" className="w-full object-cover" />
                  </div>
                )}
              </div>

              {/* Bottom Images */}
              {imageUrl1 && imagePos1 === "bottom" && (
                <div className="rounded-2xl overflow-hidden max-h-96 shadow-md">
                  <img src={imageUrl1} alt="Bottom 1" className="w-full object-cover" />
                </div>
              )}
              {imageUrl2 && imagePos2 === "bottom" && (
                <div className="rounded-2xl overflow-hidden max-h-96 shadow-md">
                  <img src={imageUrl2} alt="Bottom 2" className="w-full object-cover" />
                </div>
              )}

              {/* Bottom Navigation */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPreview(false)}
                  className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition text-sm"
                >
                  ← Back to Editor
                </button>
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-teal-700 text-white font-bold rounded-xl hover:bg-teal-800 transition shadow-md disabled:opacity-50 text-sm"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {loading ? "Publishing..." : "Confirm & Publish Post"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}