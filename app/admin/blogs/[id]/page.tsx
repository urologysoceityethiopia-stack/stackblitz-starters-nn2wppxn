"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import RoleGuard from "@/components/auth/RoleGuard";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, Image as ImageIcon, Upload, CheckCircle2, Loader2 } from "lucide-react";

export default function AdminBlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  
  const [imageUrl1, setImageUrl1] = useState("");
  const [imagePos1, setImagePos1] = useState("top");
  const [uploading1, setUploading1] = useState(false);

  const [imageUrl2, setImageUrl2] = useState("");
  const [imagePos2, setImagePos2] = useState("middle");
  const [uploading2, setUploading2] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBlog() {
      if (!id) return;
      try {
        const docRef = doc(db, "blogs", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.title || "");
          setCategory(data.category || "");
          setContent(data.content || "");
          setImageUrl1(data.imageUrl1 || "");
          setImagePos1(data.imagePos1 || "top");
          setImageUrl2(data.imageUrl2 || "");
          setImagePos2(data.imagePos2 || "middle");
        }
      } catch (err) {
        console.error("Error fetching blog:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBlog();
  }, [id]);

  const handleImageUpload = async (file: File, imageNumber: 1 | 2) => {
    if (!file) return;
    try {
      if (imageNumber === 1) setUploading1(true);
      else setUploading2(true);
      setError("");

      const storageRef = ref(storage, `blogs/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      if (imageNumber === 1) setImageUrl1(downloadUrl);
      else setImageUrl2(downloadUrl);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(`Image Upload Failed: ${err.message || "Unknown error occurred."}`);
    } finally {
      if (imageNumber === 1) setUploading1(false);
      else setUploading2(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent, imageNumber: 1 | 2) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          handleImageUpload(file, imageNumber);
          e.preventDefault();
        }
      }
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !category) {
      setError("Please fill in title, category, and content.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const docRef = doc(db, "blogs", id);
      await updateDoc(docRef, {
        title,
        category: category.trim(),
        content,
        imageUrl1,
        imagePos1,
        imageUrl2,
        imagePos2,
      });
      router.push("/admin/blogs");
    } catch (err: any) {
      setError(err.message || "Failed to update article.");
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this article?")) {
      try {
        await deleteDoc(doc(db, "blogs", id));
        router.push("/admin/blogs");
      } catch (err) {
        console.error("Error deleting blog:", err);
      }
    }
  };

  if (loading) {
    return (
      <RoleGuard allowedRoles={["admin"]}>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-medium">Loading article...</div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="min-h-screen bg-slate-50 p-8 font-sans">
        <div className="max-w-4xl mx-auto">
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <Link href="/admin/blogs" className="inline-flex items-center gap-2 text-sm text-teal-700 font-semibold mb-2 hover:underline">
                <ArrowLeft className="w-4 h-4" /> Back to Articles
              </Link>
              <h1 className="text-3xl font-extrabold text-slate-900">Edit Article</h1>
            </div>
            <button 
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition text-sm"
            >
              <Trash2 className="w-4 h-4" /> Delete Article
            </button>
          </div>

          <form onSubmit={handleUpdate} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
            {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Article Title</label>
              <input 
                type="text" 
                required 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
              <input 
                type="text" 
                required 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            {/* Image 1 Upload / Paste */}
            <div 
              onPaste={(e) => handlePaste(e, 1)}
              className="p-5 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl space-y-4 focus-within:border-teal-500"
              tabIndex={0}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                  <ImageIcon className="w-4 h-4 text-teal-700" /> Image 1 (Upload or Paste Ctrl+V)
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
                <label className="w-full flex flex-col items-center justify-center p-4 bg-white border border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition">
                  {uploading1 ? (
                    <div className="flex items-center gap-2 text-teal-700 font-medium text-sm">
                      <Loader2 className="w-5 h-5 animate-spin" /> Uploading image...
                    </div>
                  ) : imageUrl1 ? (
                    <div className="flex items-center gap-2 text-emerald-600 font-medium text-sm">
                      <CheckCircle2 className="w-5 h-5" /> Image uploaded successfully! Click to replace
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Upload className="w-5 h-5 text-teal-700" /> Click to browse or paste image here
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    className="hidden" 
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 1)}
                  />
                </label>
                {imageUrl1 && (
                  <img src={imageUrl1} alt="Preview 1" className="w-20 h-20 object-cover rounded-lg border shadow-sm" />
                )}
              </div>
            </div>

            {/* Image 2 Upload / Paste */}
            <div 
              onPaste={(e) => handlePaste(e, 2)}
              className="p-5 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl space-y-4 focus-within:border-teal-500"
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
                <label className="w-full flex flex-col items-center justify-center p-4 bg-white border border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition">
                  {uploading2 ? (
                    <div className="flex items-center gap-2 text-teal-700 font-medium text-sm">
                      <Loader2 className="w-5 h-5 animate-spin" /> Uploading image...
                    </div>
                  ) : imageUrl2 ? (
                    <div className="flex items-center gap-2 text-emerald-600 font-medium text-sm">
                      <CheckCircle2 className="w-5 h-5" /> Image uploaded successfully! Click to replace
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Upload className="w-5 h-5 text-teal-700" /> Click to browse or paste image here
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    className="hidden" 
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 2)}
                  />
                </label>
                {imageUrl2 && (
                  <img src={imageUrl2} alt="Preview 2" className="w-20 h-20 object-cover rounded-lg border shadow-sm" />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Article Content</label>
              <textarea 
                required 
                rows={10}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
              <button 
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-8 py-3 bg-teal-700 text-white font-bold rounded-xl hover:bg-teal-800 transition shadow-md disabled:opacity-50"
              >
                <Save className="w-5 h-5" /> {saving ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </form>

        </div>
      </div>
    </RoleGuard>
  );
}