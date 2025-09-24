import axios, { AxiosResponse } from 'axios';

axios.defaults.withCredentials = true;
const wishlistItemTagsApiUrl: string =
  location.hostname === 'localhost' ? `http://localhost:5000/api/wishlistItemTags` : `https://muninnfy/api/wishlistItemTags`;

type AddWishlistItemTagServicePayload = {
  wishlistId: string;
  itemId: number;
  tagName: string;
};

type AddWishlistItemTagServiceData = {
  tagId: number;
};

export async function addWishlistItemTagService(
  body: AddWishlistItemTagServicePayload
): Promise<AxiosResponse<AddWishlistItemTagServiceData>> {
  return axios.post(wishlistItemTagsApiUrl, body);
}
