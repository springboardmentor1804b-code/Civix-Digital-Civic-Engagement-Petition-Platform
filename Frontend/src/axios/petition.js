import { Api } from "./api";
import { userInfo } from "./user";


export const add = async ({id ,title,description,category,location,goal,status}) => {
  const created_user_id = (await userInfo()).user._id.toString();
  try {
    const response = await Api.post('/petitions/add' , {id,created_user_id,title,description,category,location,status,goal,created_on:new Date()});
    return {
      found: true,
      message: response.data.text,
    }
  } catch (e) {
<<<<<<< HEAD
    console.log(e);
=======
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
    return {
      found: false,
      message: e.response?.data?.text,
    }
  }
}

export const getPetitionsData = async () => {
  try {
    const response = await Api.get('/petitions/get');
    return {
      found: true,
      data: response.data
    }
  } catch (e) {
    return {
      found: false,
      message: e.response.data.text,
    }
  }
} 


export const update = async (petitionId,newStatus) => {
   try {
<<<<<<< HEAD
=======
    const user = (await userInfo()).user;
    if(user.email.endsWith("@civix.gov.in")) {
      const data = await Api.get('/petitions/get')

      const petition = data.data.filter((cur)=> cur._id === petitionId);

      try {
        const activity = "Updated the Petition status\nTitle:"+petition[0].title+"\nDescription:"+petition[0].description+"\nFrom:"+petition[0].status+"\nTo:"+newStatus;
        await Api.put('/log/addLog' , {activity , admin_id : user._id , user_id : petition[0].created_user_id});
      }catch(e) {
      }
    }
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
    const response = await Api.put(`/petitions/updateStatus/${petitionId}` ,  {status: newStatus});
    return {
      found: true,
      message: response.data.text
    }
  } catch (e) {
    return {
      found: false,
      message: e.response.data.text,
    }
  }
}


export const remove = async ({id}) => {
<<<<<<< HEAD
  try {
=======
 
  try {
    const user = (await userInfo()).user;
    if(user.email.endsWith("@civix.gov.in")) {
      const data = await Api.get('/petitions/get')

      const petition = data.data.filter((cur)=> cur._id === id);

      try {
        const activity = "Removed the Petition\nTitle:"+petition[0].title+"\nDescription:"+petition[0].description;
        await Api.put('/log/addLog' , {activity , admin_id : user._id , user_id : petition[0].created_user_id});
      }catch(e) {
      }
    }

>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
    const response = await Api.delete(`/petitions/remove/${id}`);
    return {
      found: true,
      message: response.data.text,
    }
  } catch (e) {
    return {
      found: false,
<<<<<<< HEAD
      message: e.response.data.text,
=======
      message:"Error in Deleting"
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
    }
  }
}

