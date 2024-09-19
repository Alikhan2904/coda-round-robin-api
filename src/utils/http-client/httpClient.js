import axios from 'axios';

export const postToInstance = async (url, payload) => {
  try {
    const { data } = await axios.post(url, payload, { timeout: 5000 });
    return data;
  } catch (error) {
    throw new Error('Axios error: ', error);
  }
};
