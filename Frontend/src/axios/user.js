import { Api } from "./api";
<<<<<<< HEAD
import {v4 as uuidv4} from 'uuid';

export const login = async ({email , password}) => {
  try {
    let response = await Api.post('/users/login' , {email , password});
=======

export const login = async ({ email, password }) => {
  try {
    let response = await Api.post('/users/login', { email, password });
    localStorage.setItem("token", response.data.token);
    if (email.endsWith("@civix.gov.in")) {
      const user = (await userInfo()).user;
      try {
        const activity = "Logined In to Account";
        await Api.put('/log/addLog' , {activity , admin_id : user._id , user_id : user._id});
      } catch (e) {

      }
    }
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
    return {
      found: true,
      message: `SucessFull Login`,
      token: response.data.token
    };
<<<<<<< HEAD
  }catch(e) {
    return {
      found: false,
      message: e.response?e.response.data.text:"Invalid Email/password"
    }
  }
} 


export const signup = async ({name , email , password , role , location}) => {
  
  try {
    let response = await Api.post('/users/signup' , {name,email,password , role,location});
=======
  } catch (e) {
    return {
      found: false,
      message: e.response ? e.response.data.text : "Invalid Email/password"
    };
  }
};

export const signup = async ({ name, email, password, role, location }) => {
  try {
    let response = await Api.post('/users/signup', { name, email, password, role, location });
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
    return {
      found: true,
      message: `SucessFull SignUp`,
      token: response.data.token
    };
<<<<<<< HEAD
  }catch(e) {
    return {
      found: false,
      message: e.response.data.text
    }
  }
} 

=======
  } catch (e) {
    return {
      found: false,
      message: e.response.data.text
    };
  }
};
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)

export const verify = async () => {
  try {
    const token = localStorage.getItem("token");
<<<<<<< HEAD

=======
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
    const response = await Api.get("/users/verify", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return {
      found: true,
      message: `SucessFull Login`,
    };
<<<<<<< HEAD
  }catch(e) {
    return {
      found: false,
      message: e.response.data.text
    }
  }
} 

=======
  } catch (e) {
    return {
      found: false,
      message: e.response.data.text
    };
  }
};
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)

export const userInfo = async () => {
  try {
    const token = localStorage.getItem("token");
<<<<<<< HEAD

=======
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
    const response = await Api.get("/users/userInfo", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return {
      found: true,
      message: `SucessFull Login`,
      user: response.data
    };
<<<<<<< HEAD
  }catch(e) {
    return {
      found: false,
      message: e.response.data.text
    }
  }
} 
=======
  } catch (e) {
    return {
      found: false,
      message: e.response.data.text
    };
  }
};
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)

export const get = async (id) => {
  try {
    let response = await Api.get(`/users/get/${id}`);
    return {
      found: true,
      message: `SucessFull SignUp`,
      user: response.data.user
    };
<<<<<<< HEAD
  }catch(e) {
    return {
      found: false,
      message: e.response.data.text
    }
  }
}





=======
  } catch (e) {
    return {
      found: false,
      message: e.response.data.text
    };
  }
};


export const updateProfile = async ({ name, phone, bio, socialLinks, location }) => {
  try {
    const token = localStorage.getItem("token");
    const response = await Api.put('/users/updateProfile', { name, phone, bio, socialLinks, location }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return { found: true, user: response.data.user, message: response.data.text || "Updated" };
  } catch (e) {
    return { found: false, message: e.response ? e.response.data.text : "Failed to update profile" };
  }
};

export const deleteAccount = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await Api.delete('/users/deleteAccount', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return { found: true, message: response.data.text };
  } catch (e) {
    return { found: false, message: e.response ? e.response.data.text : "Failed to delete account" };
  }
};


export const changePassword = async ({ oldPassword, newPassword }) => {
  try {
    const token = localStorage.getItem("token");
    const response = await Api.put('/users/changePassword', { oldPassword, newPassword }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return { found: true, message: response.data.text };
  } catch (e) {
    return { found: false, message: e.response ? e.response.data.text : "Failed to change password" };
  }
};


export const sendEmailOtp = async ({ email }) => {
  try {
    const response = await Api.post('/users/send-otp', { email });
    return { success: true, message: response.data.text };
  } catch (e) {
    return { success: false, message: e.response ? e.response.data.text : "Failed to send OTP" };
  }
};


export const verifyEmailOtp = async ({ email, otp }) => {
  try {
    const response = await Api.post('/users/verify-otp', { email, otp });
    return { success: true, message: response.data.text };
  } catch (e) {
    return { success: false, message: e.response ? e.response.data.text : "Invalid OTP" };
  }
};
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
