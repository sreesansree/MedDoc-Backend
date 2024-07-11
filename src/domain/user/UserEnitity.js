class User {
  constructor({
    id,
    name,
    email,
    password,
    mobile,
    profilePicture,
    gender,
    age,
    height,
    weight,
    bloodgroup,
    token,
    is_blocked,
    otp,
  }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.mobile = mobile;
    this.password = password;
    this.profilePicture =
      profilePicture ||
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
    this.gender = gender;
    this.age = age;
    this.height = height;
    this.weight = weight;
    this.bloodgroup = bloodgroup;
    this.token = token;
    this.is_blocked = is_blocked || false;
    this.otp = otp;
  }
}
export default User;
