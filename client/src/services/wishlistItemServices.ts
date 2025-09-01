import axios, { AxiosResponse } from 'axios';

axios.defaults.withCredentials = true;
const wishlistItemsApiUrl: string =
  location.hostname === 'localhost' ? `http://localhost:5000/api/wishlistItems` : `https://muninnfy/api/wishlistItems`;

interface AddWishlistItemServicePayload {
  wishlistId: string;
  title: string;
  description: string | null;
  link: string | null;
}

interface AddWishlistItemServiceData {
  wishlistItemId: number;
}

export async function addWishlistItemService(body: AddWishlistItemServicePayload): Promise<AxiosResponse<AddWishlistItemServiceData>> {
  return axios.post(wishlistItemsApiUrl, body);
}
