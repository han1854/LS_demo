// Helper to build user response object: exclude password and add FullName fallback
function buildUserResponse(userInstance) {
  const u = userInstance.get ? userInstance.get() : userInstance;
  delete u.Password;

  // Compute FullName: prefer FirstName + ' ' + LastName when available, otherwise Username
  const first = u.FirstName || u.firstName || '';
  const last = u.LastName || u.lastName || '';
  const full = (first + ' ' + last).trim();
  u.FullName = full || u.Username || u.username || '';

  return u;
}

module.exports = { buildUserResponse };