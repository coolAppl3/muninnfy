import axios, { AxiosResponse } from 'axios';

axios.defaults.withCredentials = true;
const wishlistsApiUrl: string =
  location.hostname === 'localhost' ? `http://localhost:5000/api/wishlists` : `https://muninnfy/api/wishlists`;

type CreateWishListAsAccountServicePayload = {
  privacyLevel: number;
  title: string;
};

type CreateWishListAsAccountServiceData = {
  wishlistId: string;
};

export async function createWishlistAsAccountService(
  body: CreateWishListAsAccountServicePayload
): Promise<AxiosResponse<CreateWishListAsAccountServiceData>> {
  return axios.post(wishlistsApiUrl, body);
}

export type WishlistDetailsType = {
  privacy_level: number;
  title: string;
  created_on_timestamp: number;
};

export type WishlistItemType = {
  item_id: number;
  added_on_timestamp: number;
  title: string;
  description: string | null;
  link: string | null;
  is_purchased: boolean;
  tags: {
    id: number;
    name: string;
  }[];
};

type getWishlistDetailsData = {
  wishlistDetails: WishlistDetailsType;
  wishlistItems: WishlistItemType[];
};

export async function getWishlistDetailsService(
  wishlistId: string,
  abortSignal: AbortSignal
): Promise<AxiosResponse<getWishlistDetailsData>> {
  return axios.get(`${wishlistsApiUrl}/${wishlistId}`, { signal: abortSignal });
}

type ChangeWishlistTitleServicePayload = {
  wishlistId: string;
  newTitle: string;
};

export async function changeWishlistTitleService(body: ChangeWishlistTitleServicePayload): Promise<AxiosResponse> {
  return axios.patch(`${wishlistsApiUrl}/change/title`, body);
}

type ChangeWishlistPrivacyLevelServicePayload = {
  wishlistId: string;
  newPrivacyLevel: number;
};

export async function changeWishlistPrivacyLevelService(body: ChangeWishlistPrivacyLevelServicePayload): Promise<AxiosResponse> {
  return axios.patch(`${wishlistsApiUrl}/change/privacyLevel`, body);
}

export async function deleteWishlistService(wishlistId: string): Promise<AxiosResponse> {
  return axios.delete(`${wishlistsApiUrl}/${wishlistId}`);
}
