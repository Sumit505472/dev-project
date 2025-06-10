// src/components/ProfileCard.jsx
import React from 'react';

export default function ProfileCard({ user }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4 max-w-2xl mx-auto">
      <img
        src={user.profilePicture || 'https://api.dicebear.com/6.x/pixel-art/svg?seed=User'}
        alt="Profile"
        className="w-16 h-16 rounded-full border"
      />
      <div>
        <h2 className="text-xl font-bold">{user.fullname}</h2>
        <p className="text-gray-600">{user.email}</p>
      </div>
    </div>
  );
}
