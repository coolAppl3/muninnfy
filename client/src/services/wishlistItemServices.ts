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

interface EditWishlistItemServicePayload {
  wishlistId: string;
  itemId: number;
  title: string;
  description: string | null;
  link: string | null;
  tags: string[];
}

export async function editWishlistItemService(body: EditWishlistItemServicePayload): Promise<AxiosResponse<WishlistItemInterface>> {
  return axios.patch(wishlistItemsApiUrl, body);
}

export async function deleteWishlistItemService(wishlistId: string, itemId: number): Promise<AxiosResponse> {
  return axios.delete(`${wishlistItemsApiUrl}?wishlistId=${wishlistId}&itemId=${itemId}`);
}
