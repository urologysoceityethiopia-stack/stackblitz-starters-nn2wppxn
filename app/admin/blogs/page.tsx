"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import RoleGuard from "@/components/auth/RoleGuard";
import Link from "next/link";
import { Plus, Trash2, Edit, ArrowLeft, FileText } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  category: string;
  content: string;
  imageUrl1?: string;
  createdAt?: any;
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "blogs"));
      const list: BlogPost[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as BlogPost);
      });
      setBlogs(list);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this blog article?")) {
      try {
        await deleteDoc(doc(db, "blogs", id));
        setBlogs(blogs.filter(b => b.id !== id));
      } catch (error) {
        console.error("Error deleting blog:", error);
      }
    }
  };

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="min-h-screen bg-slate-50 p-8 font-sans">
        <div className="max-w-6xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-teal-700 font-semibold mb-2 hover:underline">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </Link>
              <h1 className="text-3xl font-extrabold text-slate-900">Manage Articles & Blogs</h1>
              <p className="text-slate-600 mt-1">Create, review, and delete health articles published on the platform.</p>
            </div>
            <Link 
              href="/admin/blogs/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-700 text-white font-bold rounded-xl hover:bg-teal-800 transition shadow-sm"
            >
              <Plus className="w-5 h-5" /> Write New Article
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-500 font-medium">Loading articles...</div>
            ) : blogs.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                No blog articles found. Click &quot;Write New Article&quot; to create one.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="p-4">Article Title</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Preview</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {blogs.map(blog => (
                      <tr key={blog.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-4 font-bold text-slate-900 flex items-center gap-3">
                          {blog.imageUrl1 ? (
                            <img src={blog.imageUrl1} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700">
                              <FileText className="w-5 h-5" />
                            </div>
                          )}
                          <span className="line-clamp-1">{blog.title}</span>
                        </td>
                        <td className="p-4">
                          <span className="px-3 py-1 bg-teal-50 text-teal-700 font-medium rounded-full text-xs">
                            {blog.category || "General"}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 max-w-xs truncate">{blog.content}</td>
                        <td className="p-4 text-right space-x-2">
                          <Link 
                            href={`/admin/blogs/${blog.id}`}
                            className="inline-flex p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                            title="View / Edit Article"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button 
                            onClick={() => handleDelete(blog.id)}
                            className="inline-flex p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                            title="Delete Article"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </RoleGuard>
  );
}
