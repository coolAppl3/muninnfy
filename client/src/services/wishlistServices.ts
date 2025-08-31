import axios, { AxiosResponse } from 'axios';

axios.defaults.withCredentials = true;
const wishlistsApiUrl: string =
  location.hostname === 'localhost' ? `http://localhost:5000/api/wishlists` : `https://muninnfy/api/wishlists`;

interface CreateWishListAsAccountServicePayload {
  privacyLevel: number;
  title: string;
}

interface CreateWishListAsAccountServiceData {
  wishlistId: string;
}

export async function createWishlistAsAccountService(
  body: CreateWishListAsAccountServicePayload
): Promise<AxiosResponse<CreateWishListAsAccountServiceData>> {
  return axios.post(wishlistsApiUrl, body);
}

interface CreateWishListAsGuestServicePayload {
  title: string;
}

interface CreateWishListAsGuestServiceData {
  wishlistId: string;
}

export async function createWishlistAsGuestService(
  body: CreateWishListAsGuestServicePayload
): Promise<AxiosResponse<CreateWishListAsGuestServiceData>> {
  return axios.post(`${wishlistsApiUrl}/guest`, body);
}
