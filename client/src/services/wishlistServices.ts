import axios, { AxiosResponse } from 'axios';
import { ExtendedWishlistDetailsType, WishlistDetailsType } from '../types/wishlistTypes';
import { WishlistItemType } from '../types/wishlistItemTypes';

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

type GetWishlistDetailsData = {
  wishlistDetails: WishlistDetailsType;
  wishlistItems: WishlistItemType[];
};

export async function getWishlistDetailsService(
  wishlistId: string,
  abortSignal: AbortSignal
): Promise<AxiosResponse<GetWishlistDetailsData>> {
  return axios.get(`${wishlistsApiUrl}/${wishlistId}`, { signal: abortSignal });
}

export async function crossWishlistSearchService(itemTitleQuery: string): Promise<AxiosResponse<string[]>> {
  return axios.get(`${wishlistsApiUrl}/crossWishlistSearch/${itemTitleQuery}`);
}

export type CombinedWishlistsStatistics = {
  totalWishlistsCount: number;
  totalItemsCount: number;
  totalPurchasedItemsCount: number;
  totalWishlistsWorth: number;
  totalWishlistsSpent: number;
  totalWishlistsToComplete: number;
};

type GetAllWishlistsServiceData = {
  wishlists: ExtendedWishlistDetailsType[];
  combinedWishlistsStatistics: CombinedWishlistsStatistics;
};

export async function getAllWishlistsService(abortSignal: AbortSignal): Promise<AxiosResponse<GetAllWishlistsServiceData>> {
  return axios.get(`${wishlistsApiUrl}/all`, { signal: abortSignal });
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

export async function deleteEmptyWishlistsService(): Promise<AxiosResponse> {
  return axios.delete(`${wishlistsApiUrl}/empty`);
}

export async function deleteWishlistService(wishlistId: string): Promise<AxiosResponse> {
  return axios.delete(`${wishlistsApiUrl}/${wishlistId}`);
}
