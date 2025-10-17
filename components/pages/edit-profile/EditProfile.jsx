"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Coffee, Loader2, Camera, LinkIcon } from 'lucide-react';
import Link from 'next/link';
import useAxiosWithAuth from "@/hooks/useAxiosWithAuth";
import { useRouter } from 'next/navigation';

const PatreonLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.82 3C11.4 3 8.64 5.76 8.64 9.18C8.64 12.58 11.4 15.36 14.82 15.36C18.22 15.36 21 12.58 21 9.18C21 5.76 18.22 3 14.82 3Z" fill="#F96854"/>
    <path d="M3 21H6.68V3H3V21Z" fill="#052D49"/>
  </svg>
);

const BuyMeACoffeeLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.5 4.5H16.5C17.12 4.5 17.67 5.02 17.74 5.68L18.75 14.51C18.82 15.53 18.06 16.5 16.99 16.71C14.5 17.18 11.5 17.18 9.01 16.71C7.94 16.5 7.19 15.53 7.25 14.51L8.26 5.68C8.33 5.02 8.88 4.5 9.5 4.5" stroke="#FFDD00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 4.5V2.5" stroke="#FFDD00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 8.5H7" stroke="#FFDD00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19 19.5L18.25 21C18.07 21.62 17.49 22 16.83 22H7.17C6.51 22 5.93 21.62 5.75 21L5 19.5" stroke="#FFDD00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function ProfileEditPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [patreon, setPatreon] = useState("");
  const [buyMeACoffee, setBuyMeACoffee] = useState("");
  const [twitter, setTwitter] = useState("");
  const [discord, setDiscord] = useState("");

  const { axiosInstance, loading } = useAxiosWithAuth();
  const router = useRouter();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  async function getProfile() {
    try {
      const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/profile`);
      if (response.data && response.data.success) {
        const profileData = response.data.success.data;
        setBio(profileData.bio || "");
        setUsername(profileData.username || "");
        setEmail(profileData.email || "");
        setFirstName(profileData.first_name || "");
        setLastName(profileData.last_name || "");
        setProfileImage(profileData.profile_photo || null);
        setBannerImage(profileData.cover_photo || null);
        setPatreon(profileData.patreon_username || "");
        setBuyMeACoffee(profileData.bmac_username || "");
        setTwitter(profileData.twitter_username ? `https://twitter.com/${profileData.twitter_username}` : "");
        setDiscord(profileData.discord_username ? `https://discord.com/${profileData.discord_username}` : "");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setErrorMessage("Failed to load profile data");
    }
  }

  async function updateProfile() {
    try {
      const formData = new FormData();
      formData.append("first_name", firstName || "");
      formData.append("last_name", lastName || "");
      formData.append("bio", bio || "");
      formData.append("username", username || "");
      formData.append("patreon_username", patreon || "");
      formData.append("bmac_username", buyMeACoffee || "");
      formData.append("twitter_username", twitter || "");
      formData.append("discord_username", discord || "");
      
      if (profileImageFile) {
        formData.append("profile_photo", profileImageFile);
      }
      if (bannerImageFile) {
        formData.append("cover_photo", bannerImageFile);
      }

      const response = await axiosInstance.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/profile`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data && response.data.success) {
        router.push("/profile");
      } else {
        setErrorMessage("Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setErrorMessage("An error occurred while saving changes");
    }
  }

  const handleSave = async () => {
    setSaving(true);
    setErrorMessage('');
    await updateProfile();
    setSaving(false);
  };

  useEffect(() => {
    getProfile();
  }, []);

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}
    >
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {errorMessage}
          </div>
        )}
        <div className={`rounded-xl shadow-xl overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
          <div className="relative h-48 md:h-64 bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden">
            {bannerImage && (
              <img 
                src={typeof bannerImage === 'string' ? bannerImage : URL.createObjectURL(bannerImage)} 
                alt="Banner" 
                className="w-full h-full object-cover"
                onError={() => setBannerImage(null)}
              />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <div className="absolute bottom-4 right-4">
                <label className={`cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-700'} shadow-lg hover:shadow-xl transition-all duration-300`}>
                  <Camera className="h-4 w-4" />
                  <span className="text-sm font-medium">Change Banner</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setBannerImage(e.target.files[0]);
                        setBannerImageFile(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
          
          <div className="relative px-6 sm:px-12 py-6">
            <div className="absolute -top-16 left-6 sm:left-12">
              <div className="relative group">
                <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 ${darkMode ? 'border-gray-800' : 'border-white'} shadow-lg`}>
                  {profileImage ? (
                    <img 
                      src={typeof profileImage === 'string' ? profileImage : URL.createObjectURL(profileImage)} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={() => setProfileImage(null)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <svg className="w-16 h-16 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 14.2L12 16L18 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8.5 12L12 15L20 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7 10L10 13L13 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white cursor-pointer hover:bg-blue-700 transition-colors duration-300">
                  <Camera className="h-4 w-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setProfileImage(e.target.files[0]);
                        setProfileImageFile(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
            
            <div className="ml-28 md:ml-36 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold">{firstName} {lastName}</h1>
                {/* <a 
                  href="#"
                  className={`text-sm flex items-center gap-1 hover:underline ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}
                >
                  untitledui.com/{username}
                  <LinkIcon className="h-3 w-3" />
                </a> */}
              </div>
            </div>
          </div>
          
          <div className={`px-6 sm:px-12 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex space-x-6 overflow-x-auto no-scrollbar">
              {['profile'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors duration-200 ${
                    activeTab === tab
                      ? darkMode 
                        ? 'border-blue-500 text-blue-400' 
                        : 'border-blue-600 text-blue-600'
                      : darkMode
                        ? 'border-transparent text-gray-400 hover:text-gray-300'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className={`px-6 sm:px-12 transition-colors duration-300`}>
            <div className="max-w-4xl mx-auto py-8">
              {/* <motion.div 
                className="mb-12"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center dark:bg-blue-900 dark:text-blue-300">1</span>
                  Company Profile
                </h2>
                <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Update your company information that will be displayed publicly.
                </p>
                
                <div className="space-y-6">
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Company Name
                    </label>
                    <input 
                      type="text" 
                      value="Company Name"
                      disabled
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                          : 'bg-white border-gray-300 focus:border-blue-500'
                      } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-30 outline-none transition-all duration-300`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Website
                    </label>
                    <div className="flex">
                      <span className={`inline-flex items-center px-4 py-2.5 rounded-l-lg border border-r-0 ${
                        darkMode 
                          ? 'bg-gray-800 border-gray-600 text-gray-400' 
                          : 'bg-gray-50 border-gray-300 text-gray-500'
                      }`}>
                        untitledui.com/
                      </span>
                      <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={`flex-1 px-4 py-2.5 rounded-r-lg border ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                            : 'bg-white border-gray-300 focus:border-blue-500'
                        } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-30 outline-none transition-all duration-300`}
                      />
                    </div>
                  </div>
                </div>
              </motion.div> */}
              
              <motion.div 
                className="mb-12"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center dark:bg-blue-900 dark:text-blue-300">1</span>
                  Personal Information
                </h2>
                <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Tell us about yourself. This information will be visible on your profile.
                </p>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        First Name
                      </label>
                      <input 
                        type="text" 
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-lg border ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                            : 'bg-white border-gray-300 focus:border-blue-500'
                        } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-30 outline-none transition-all duration-300`}
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm enumerable mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Last Name
                      </label>
                      <input 
                        type="text" 
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-lg border ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                            : 'bg-white border-gray-300 focus:border-blue-500'
                        } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-30 outline-none transition-all duration-300`}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Bio
                    </label>
                    <textarea 
                      placeholder="Write a short bio about yourself..."
                      rows={4}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                          : 'bg-white border-gray-300 focus:border-blue-500'
                      } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-30 outline-none transition-all duration-300`}
                    />
                    <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Brief description for your profile. URLs are hyperlinked.
                    </p>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Username
                    </label>
                    <div className="flex">
                      <span className={`inline-flex items-center px-4 py-2.5 rounded-l-lg border border-r-0 ${
                        darkMode 
                          ? 'bg-gray-800 border-gray-600 text-gray-400' 
                          : 'bg-gray-50 border-gray-300 text-gray-500'
                      }`}>
                        @
                      </span>
                      <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={`flex-1 px-4 py-2.5 rounded-r-lg border ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                            : 'bg-white border-gray-300 focus:border-blue-500'
                        } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-30 outline-none transition-all duration-300`}
                      />
                    </div>
                    <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Your username will be used in your profile URL.
                    </p>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email Address
                    </label>
                    <input 
                      type="email" 
                      value={email}
                      disabled
                      className={`w-full px-4 py-2.5 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                          : 'bg-white border-gray-300 focus:border-blue-500'
                      } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-30 outline-none transition-all duration-300`}
                    />
                    <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Your Email cannot be changed.
                    </p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="mb-12"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center dark:bg-blue-900 dark:text-blue-300">2</span>
                  Support Links
                </h2>
                <p className={`text-sm mb-6 text-wrap ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Add links where people can support your work. (Please enter full links for these)
                </p>
                
                <div className="space-y-6">
                  <div>
                    <label className={`flex items-center gap-2 text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <PatreonLogo />
                      Patreon Link
                    </label>
                    <div className="flex">
                      <span className={`inline-flex items-center px-4 py-2.5 rounded-l-lg border border-r-0 ${
                        darkMode 
                          ? 'bg-gray-800 border-gray-600 text-gray-400' 
                          : 'bg-gray-50 border-gray-300 text-gray-500'
                      }`}>
                        patreon.com/
                      </span>
                      <input 
                        type="text" 
                        value={patreon}
                        onChange={(e) => setPatreon(e.target.value)}
                        placeholder="yourusername"
                        className={`flex-1 px-4 py-2.5 rounded-r-lg border ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                            : 'bg-white border-gray-300 focus:border-blue-500'
                        } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-30 outline-none transition-all duration-300`}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className={`flex items-center gap-2 text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <Coffee className="w-5 h-5" />
                      Buy Me A Coffee Link
                    </label>
                    <div className="flex">
                      <span className={`inline-flex items-center px-4 py-2.5 rounded-l-lg border border-r-0 ${
                        darkMode 
                          ? 'bg-gray-800 border-gray-600 text-gray-400' 
                          : 'bg-gray-50 border-gray-300 text-gray-500'
                      }`}>
                        buymeacoffee.com/
                      </span>
                      <input 
                        type="text" 
                        value={buyMeACoffee}
                        onChange={(e) => setBuyMeACoffee(e.target.value)}
                        placeholder="yourusername"
                        className={`flex-1 px-4 py-2.5 rounded-r-lg border ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                            : 'bg-white border-gray-300 focus:border-blue-500'
                        } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-30 outline-none transition-all duration-300`}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="mb-12"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center dark:bg-blue-900 dark:text-blue-300">3</span>
                  Social Profiles
                </h2>
                <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Connect your social media accounts to your profile.
                </p>
                
                <div className="space-y-6">
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Twitter
                    </label>
                    <div className="flex">
                      <span className={`inline-flex items-center px-4 py-2.5 rounded-l-lg border border-r-0 ${
                        darkMode 
                          ? 'bg-gray-800 border-gray-600 text-gray-400' 
                          : 'bg-gray-50 border-gray-300 text-gray-500'
                      }`}>
                        twitter.com/
                      </span>
                      <input 
                        type="text" 
                        value={twitter}
                        onChange={(e) => setTwitter(e.target.value)}
                        className={`flex-1 px-4 py-2.5 rounded-r-lg border ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                            : 'bg-white border-gray-300 focus:border-blue-500'
                        } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-30 outline-none transition-all duration-300`}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Discord
                    </label>
                    <div className="flex">
                      <span className={`inline-flex items-center px-4 py-2.5 rounded-l-lg border border-r-0 ${
                        darkMode 
                          ? 'bg-gray-800 border-gray-600 text-gray-400' 
                          : 'bg-gray-50 border-gray-300 text-gray-500'
                      }`}>
                        discord.com/
                      </span>
                      <input 
                        type="text" 
                        value={discord}
                        onChange={(e) => setDiscord(e.target.value)}
                        className={`flex-1 px-4 py-2.5 rounded-r-lg border ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                            : 'bg-white border-gray-300 focus:border-blue-500'
                        } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-30 outline-none transition-all duration-300`}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
          
          <div className={`px-6 sm:px-12 py-6 border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'} flex items-center justify-between`}>
            <Link href={'/profile'}>
              <button 
                className={`px-4 py-2 rounded-lg text-sm font-medium ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300'} transition-colors duration-300`}
              >
                Cancel
              </button>
            </Link>
            <motion.button 
              className={`px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2 min-w-32 justify-center ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white transition-colors duration-300`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={saving || loading}
            >
              {saving || loading ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save changes</span>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}