import React from 'react';

export default function Welcome({ user }) {
  return (
    <div style={{ background: '#e3f2fd', borderRadius: 12, padding: 24, marginBottom: 24 }}>
      <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Welcome back, {user ? user.name : "User"}!</h2>
      <p style={{ color: '#333', fontSize: 16 }}>
        See what's happening in your community and make your voice heard.
      </p>
    </div>
  );
}