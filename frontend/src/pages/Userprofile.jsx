import { useState } from "react"
import ProfileHeader from "../components/ui/Profile/ProfileHeader.jsx"
import AccountInformation from "../components/ui/Profile/AccountInformation.jsx"
import RecentAnnotations from "../components/ui/Profile/RecentAnnotation.jsx"
import ProfileFooter from "../components/ui/Profile/ProfileFooter.jsx"

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false)
  const [userData, setUserData] = useState({
    name: "Sitharath Srey",
    username: "sitharath",
    bio: "Data annotation specialist with 3 years of experience in machine learning projects. Passionate about creating high-quality labeled datasets for AI applications.",
    email: "sitharath.srey@example.com",
    phone: "+ 855 123 456 789",
    joinedDate: "January 1, 2025",
    role: "Researcher",
    organization: "CADT"
  })

  const recentAnnotations = [
    {
      id: 1,
      imageName: "angkor_wat_temple_01.jpg",
      category: "Historical Monument",
      timestamp: "2 hours ago",
      status: "completed",
    },
    {
      id: 2,
      imageName: "khmer_traditional_dance.jpg",
      category: "Cultural Activity",
      timestamp: "5 hours ago",
      status: "completed",
    },
    {
      id: 3,
      imageName: "phnom_penh_street_view.jpg",
      category: "Urban Landscape",
      timestamp: "1 day ago",
      status: "completed",
    },
    {
      id: 4,
      imageName: "cambodian_cuisine_amok.jpg",
      category: "Food & Cuisine",
      timestamp: "1 day ago",
      status: "completed",
    },
    {
      id: 5,
      imageName: "tonle_sap_lake.jpg",
      category: "Natural Landscape",
      timestamp: "2 days ago",
      status: "completed",
    },
  ]

  const handleUpdateProfile = (updatedData) => {
    setUserData({ ...userData, ...updatedData })
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ProfileHeader userData={userData} isEditing={isEditing} onUpdate={handleUpdateProfile} />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AccountInformation
            userData={userData}
            onEditClick={() => setIsEditing(!isEditing)}
            isEditing={isEditing}
            onUpdate={handleUpdateProfile}
          />
          <RecentAnnotations annotations={recentAnnotations} />
        </div>

        <ProfileFooter email="Bot.bot@gmail.com" />
      </div>
    </div>
  )
}
