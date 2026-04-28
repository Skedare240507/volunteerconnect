"use client";

import { motion } from "framer-motion";
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Save, 
  Camera, 
  Building2,
  Mail,
  MapPin,
  Lock,
  Smartphone,
  CreditCard,
  Target
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { db, storage } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export default function NgoSettingsPage() {
  const { user, userData } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [mission, setMission] = useState("");
  const [photoURL, setPhotoURL] = useState("");

  useEffect(() => {
    if (userData) {
      setDisplayName(userData.name || userData.displayName || "");
      setEmail(userData.email || "");
      setAddress(userData.address || "");
      setMission(userData.mission || "");
      setPhotoURL(userData.photoURL || "");
    }
  }, [userData]);

  const TABS = [
    { id: "profile", label: "Organization Profile", icon: Building2 },
    { id: "security", label: "Security & Access", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (userData?.role === "user") {
      alert("Operational restriction: Only organization representatives can update the official profile image.");
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const storageRef = ref(storage, `profiles/${Date.now()}_${file.name}`);
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

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        name: displayName,
        displayName: displayName,
        email,
        address,
        mission,
        photoURL,
      });
      alert("Settings updated successfully!");
    } catch (e) {
      console.error("Error updating settings", e);
      alert("Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Configuration Center</h1>
        <p className="text-text-secondary text-sm">Manage your institution's profile, security protocols, and operational preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation */}
        <div className="lg:w-64 flex flex-col gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all text-left ${
                activeTab === tab.id 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'glass text-text-muted hover:text-white border border-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          {activeTab === "profile" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-8">
                <div className="flex flex-col md:flex-row items-center gap-8 border-b border-white/5 pb-8">
                   <div className="relative group">
                      <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden">
                         {photoURL ? (
                            <img src={photoURL} alt="Organization" className="w-full h-full object-cover" />
                         ) : (
                            <Building2 className="w-12 h-12 text-primary/50" />
                         )}
                      </div>
                      <label title="Change Organization Image" className="absolute -bottom-2 -right-2 p-3 bg-primary text-white rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer">
                         {uploadingImage ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Camera className="w-4 h-4" />}
                         <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploadingImage} />
                      </label>
                   </div>
                   <div className="text-center md:text-left">
                      <h3 className="text-xl font-bold">{displayName || "Hope Care Foundation"}</h3>
                      <p className="text-text-muted text-sm px-2 py-0.5 bg-white/5 border border-white/10 rounded-full inline-block mt-2">Verified Organization</p>
                   </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-text-muted uppercase tracking-widest pl-1">Display Name</label>
                      <div className="relative">
                         <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                         <input title="Organization Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-primary transition-all font-medium" placeholder="Organization Name" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-text-muted uppercase tracking-widest pl-1">Primary Email</label>
                      <div className="relative">
                         <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                         <input title="Organization Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-primary transition-all font-medium" placeholder="Email Address" />
                      </div>
                   </div>
                   <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-text-muted uppercase tracking-widest pl-1">Headquarters Address</label>
                      <div className="relative">
                         <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                         <input title="Headquarters Address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-primary transition-all font-medium" placeholder="Full Address" />
                      </div>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-bold text-text-muted uppercase tracking-widest pl-1">Our Mission Statement</label>
                   <textarea title="Mission Statement" value={mission} onChange={(e) => setMission(e.target.value)} rows={4} className="w-full bg-black/20 border border-white/10 rounded-2xl p-6 text-sm focus:border-primary transition-all font-medium resize-none" placeholder="Describe your mission..." />
                </div>
              </div>

              <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                 <h4 className="font-bold flex items-center gap-2"><Target className="w-4 h-4 text-accent" /> Impact Alignment</h4>
                 <div className="flex flex-wrap gap-3">
                    {["No Poverty", "Zero Hunger", "Good Health", "Clean Water"].map(goal => (
                      <span key={goal} className="px-4 py-2 bg-accent/10 border border-accent/20 rounded-xl text-accent text-xs font-bold">{goal}</span>
                    ))}
                    <button className="px-4 py-2 border border-white/10 rounded-xl text-text-muted text-xs font-bold hover:bg-white/5">+ Add SDG</button>
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-8">
                 <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-lg">Two-Factor Authentication</h4>
                      <p className="text-xs text-text-muted mt-1">Add an extra layer of security to your organization account.</p>
                    </div>
                    <div className="w-12 h-6 bg-emerald-500 rounded-full relative p-1 cursor-pointer">
                       <div className="w-4 h-4 bg-white rounded-full absolute right-1 shadow-sm" />
                    </div>
                 </div>

                 <div className="grid gap-4">
                    <button className="w-full p-4 glass rounded-2xl border border-white/5 flex items-center justify-between hover:border-white/10 group transition-all text-left">
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-white/5 rounded-xl"><Smartphone className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" /></div>
                          <div>
                            <p className="text-sm font-bold">Authentication App</p>
                            <p className="text-[10px] text-text-muted">Google Authenticator, Authy, etc.</p>
                          </div>
                       </div>
                       <span className="text-[10px] font-black text-emerald-400 uppercase">Configured</span>
                    </button>
                    <button className="w-full p-4 glass rounded-2xl border border-white/5 flex items-center justify-between hover:border-white/10 group transition-all text-left">
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-white/5 rounded-xl"><Lock className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" /></div>
                          <div>
                            <p className="text-sm font-bold">Change Master Password</p>
                            <p className="text-[10px] text-text-muted">Last changed 45 days ago</p>
                          </div>
                       </div>
                       <span className="text-[10px] font-black text-primary uppercase">Update</span>
                    </button>
                 </div>
              </div>

              <div className="glass p-8 rounded-[2.5rem] border border-white/5 bg-red-500/5 border-red-500/10">
                 <h4 className="text-red-400 font-bold mb-1">Danger Zone</h4>
                 <p className="text-xs text-text-muted mb-6">Irreversible actions for your organization profile.</p>
                 <button className="w-full p-4 border border-red-500/30 rounded-2xl text-red-500 font-bold text-xs hover:bg-red-500/10 transition-all">
                    Deactivate Account
                 </button>
              </div>
            </motion.div>
          )}

          <div className="flex justify-end pt-4">
             <button
               onClick={handleSave}
               disabled={saving}
               className="px-8 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
             >
               {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
               Save System Changes
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
