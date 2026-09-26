import { useAuth } from '../context/AuthContext'
function Profile() {
    const { profile, loading } = useAuth()

    // 1. Check the actual loading state first
    if (loading) return <div className="page-loading">Loading profile...</div>

    // 2. If it's done loading but there is no profile data, show an error
    if (!profile) {
        return (
            <div className="profile-page">
                <h1>Profile Not Found</h1>
                <p>Your account exists, but your profile data is missing from the database. If this is an older test account, please delete it and sign up again.</p>
            </div>
        )
    }

    // 3. Render the profile if everything is good
    return (
        <div className="profile-page">
            <h1>My Profile</h1>
            <p><strong>Name:</strong> {profile.full_name}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Role:</strong> {profile.role}</p>
        </div>
    )
}

export default Profile


//admin Name: member
//
// Email: member@forge.com
//
// Role: admin


// trainer
// Name: test
//
// Email: user@test.com
//
// Role: trainer


// normal user/member
//any details when they sign up