export const publicUser = user => ({
  id: user._id, fullName: user.fullName, email: user.email, mobile: user.mobile, age: user.age, role: user.role
});
