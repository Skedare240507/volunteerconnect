"use client";

import { motion } from "framer-motion";
import { 
  AlertTriangle, 
  ArrowLeft, 
  ChevronRight, 
  MapPin, 
  Plus, 
  Sparkles,
  Upload,
  Info
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import { logActivity } from "@/lib/activity";
import dynamic from "next/dynamic";

const LocationPickerMap = dynamic(() => import("@/components/LocationPickerMap"), { ssr: false });

const categories = ["Food", "Health", "Shelter", "Education", "Eldercare", "Other"];

export default function NewResourcePage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Form State
  const [category, setCategory] = useState("Food");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [photoURL, setPhotoURL] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [affected, setAffected] = useState("");
  const [skills, setSkills] = useState("Any");

  const handleLocationSelect = (selectedLat: number, selectedLng: number, address: string) => {
    setLat(selectedLat);
    setLng(selectedLng);
    // Prefer geocoded address if location is currently empty or user doesn't want to type
    if (!address) return;
    setLocation(address);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const storageRef = ref(storage, `resources/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        () => {},
        (error) => {
          console.error("Image upload failed", error);
          alert("Image upload failed");
          setUploadingImage(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setPhotoURL(downloadURL);
          setUploadingImage(false);
        }
      );
    } catch (err) {
      console.error(err);
      setUploadingImage(false);
    }
  };

  // Simulated AI scoring Logic
  const getAiScore = () => {
    if (description.length < 10) return 0;
    if (description.toLowerCase().includes("urgent") || description.toLowerCase().includes("critical")) return 8.7;
    return 4.2;
  };

  const aiScore = getAiScore();

  const handleBroadcast = async () => {
    setLoading(true);
    try {
      const resourceData = {
        category,
        title,
        description,
        location,
        lat,
        lng,
        photoURL,
        affected: parseInt(affected) || 0,
        skills,
        aiScore,
        status: "Open",
        createdAt: serverTimestamp(),
      };

      const resourceRef = await addDoc(collection(db, "resources"), resourceData);
      
      await logActivity({
        user: "City NGO",
        action: "Posted new resource",
        target: title,
        type: "info"
      });

      // Trigger AI Match
      await fetch("/api/match", {
        method: "POST",
        body: JSON.stringify({
          resourceId: resourceRef.id,
          ...resourceData
        })
      });

      // Navigate back to dashboard with success
      router.push("/dashboard/ngo?success=true");
    } catch (error) {
      console.error("Error broadcasting resource:", error);
      alert("Failed to broadcast resource. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/ngo/resources" className="p-2 glass rounded-xl hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Post New Resource</h1>
          <p className="text-text-secondary text-sm">Fill in the details to broadcast this need to your coordinators.</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-2">
        {[1, 2, 3].map((s) => (
          <div 
            key={s} 
            className={`h-1 flex-grow rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-white/10'}`} 
          />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form Area */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div 
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass p-8 rounded-3xl space-y-6"
          >
            {step === 1 && (
              <>
                <div className="space-y-4">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <Plus className="w-4 h-4 text-primary" /> Select Category
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {categories.map((cat) => (
                      <button 
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`py-3 px-4 rounded-xl text-sm font-medium transition-all border ${
                          category === cat 
                            ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(29,185,117,0.2)]" 
                            : "glass border-white/5 hover:bg-white/10"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold">Resource Title</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Urgent Food Distribution for 20 Families" 
                    className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 focus:border-primary outline-none transition-colors"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold">Detail Description</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the need, people affected, and any specific requirements..." 
                    className="w-full h-32 rounded-xl bg-white/5 border border-white/10 p-4 focus:border-primary outline-none resize-none"
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-4">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" /> Location Details
                  </label>
                  <LocationPickerMap onLocationSelect={handleLocationSelect} />
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter full address or landmark or map selection" 
                    className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 focus:border-primary outline-none transition-colors"
                  />
                </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold">People Affected</label>
                    <input 
                      type="number" 
                      value={affected}
                      onChange={(e) => setAffected(e.target.value)}
                      placeholder="0" 
                      className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 outline-none focus:border-primary" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Exp. Skills Needed</label>
                    <select 
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      title="Select required skills" 
                      className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 outline-none focus:border-primary"
                    >
                      <option>Any</option>
                      <option>Medical</option>
                      <option>Logistics</option>
                      <option>Rescue</option>
                    </select>
                  </div>
              </>
            )}

            {step === 3 && (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 overflow-hidden">
                  {photoURL ? (
                    <img src={photoURL} alt="Uploaded" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="w-10 h-10 text-primary" />
                  )}
                </div>
                <h3 className="text-xl font-bold mb-2">Upload Reference Photo</h3>
                <p className="text-text-secondary text-sm mb-8">Optional: Attach a photo of the area or situation.</p>
                <label className="px-8 py-3 glass rounded-xl border-dashed border-2 border-white/20 hover:border-primary/50 transition-all cursor-pointer">
                  {uploadingImage ? "Uploading..." : photoURL ? "Change File" : "Browse Files"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                    disabled={uploadingImage}
                  />
                </label>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              {step > 1 && (
                <button onClick={() => setStep(step - 1)} className="flex-grow py-4 glass rounded-2xl font-bold">
                  Back
                </button>
              )}
              <button 
                disabled={loading}
                onClick={() => step < 3 ? setStep(step + 1) : handleBroadcast()}
                className={`flex-[2] py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all ${
                  loading ? "bg-white/10 cursor-not-allowed" : "bg-primary shadow-primary/20 hover:scale-105 active:scale-95"
                }`}
              >
                {loading ? "Broadcasting..." : step === 3 ? "Broadcast Resource" : "Continue"} 
                {!loading && <ChevronRight className="w-5 h-5" />}
              </button>
            </div>
          </motion.div>
        </div>

        {/* AI Insight Sidebar */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-3xl border border-primary/20 bg-primary/5">
            <div className="flex items-center gap-2 text-primary font-bold mb-6">
              <Sparkles className="w-5 h-5" /> AI Urgency Insight
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">Estimated Score</span>
              <span className="text-2xl font-black text-primary">{aiScore}</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-6">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${aiScore * 10}%` }}
                className="h-full bg-primary" 
              />
            </div>

            <p className="text-xs text-text-muted leading-relaxed">
              Gemini analyzes your description for keywords related to health, life-safety, and group size.
            </p>
          </div>

          <div className="glass p-6 rounded-3xl">
            <div className="flex items-center gap-2 text-text-secondary font-bold mb-4">
              <Info className="w-4 h-4" /> Submission Tips
            </div>
            <ul className="text-xs text-text-muted space-y-3">
              <li className="flex gap-2">
                <span className="text-primary">•</span> Be specific about the number of people affected.
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span> Mention if immediate medical aid is required.
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span> Provide landmark details if GPS is unavailable.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
