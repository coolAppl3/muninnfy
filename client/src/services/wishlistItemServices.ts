import axios, { AxiosResponse } from 'axios';
import { WishlistItemInterface } from './wishlistServices';

axios.defaults.withCredentials = true;
const wishlistItemsApiUrl: string =
  location.hostname === 'localhost' ? `http://localhost:5000/api/wishlistItems` : `https://muninnfy/api/wishlistItems`;

interface AddWishlistItemServicePayload {
  wishlistId: string;
  title: string;
  description: string | null;
  link: string | null;
  tags: string[];
}

export async function addWishlistItemService(body: AddWishlistItemServicePayload): Promise<AxiosResponse<WishlistItemInterface>> {
  return axios.post(wishlistItemsApiUrl, body);
}
