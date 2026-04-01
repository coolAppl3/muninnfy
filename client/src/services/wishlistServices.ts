import { AxiosResponse } from 'axios';
import axiosInstance from './axiosInstance';
import { WishlistItemType } from '../types/wishlistItemTypes';
import {
  ExtendedWishlistDetailsType,
  ViewWishlistDetails,
  ViewWishlistDetailsType,
  ViewWishlistOwnerDetails,
  WishlistDetailsType,
} from '../types/wishlistTypes';

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
  return axiosInstance.post('/wishlists', body);
}

type GetWishlistDetailsData = {
  wishlistDetails: WishlistDetailsType;
  wishlistItems: WishlistItemType[];
};

export async function getWishlistDetailsService(
  wishlistId: string,
  abortSignal: AbortSignal
): Promise<AxiosResponse<GetWishlistDetailsData>> {
  return axiosInstance.get(`/wishlists/${wishlistId}`, { signal: abortSignal });
}

type GetViewWishlistDetailsData = {
  ownerDetails: ViewWishlistOwnerDetails;
  viewWishlistDetails: ViewWishlistDetailsType;
  wishlistItems: WishlistItemType[];
};

export async function getViewWishlistDetailsService(
  wishlistId: string,
  abortSignal: AbortSignal
): Promise<AxiosResponse<GetViewWishlistDetailsData>> {
  return axiosInstance.get(`/wishlists/view/${wishlistId}`, { signal: abortSignal });
}

export async function crossWishlistSearchService(
  itemTitleQuery: string
): Promise<AxiosResponse<string[]>> {
  return axiosInstance.get(`/wishlists/crossWishlistSearch/${itemTitleQuery}`);
}

export async function viewCrossWishlistSearchService(
  itemTitleQuery: string,
  publicAccountId?: string
): Promise<AxiosResponse<string[]>> {
  return axiosInstance.get('/wishlists/crossWishlistSearch', {
    params: { publicAccountId, itemTitleQuery },
  });
}

export type CombinedWishlistsStatistics = {
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

export async function getAllWishlistsService(
  abortSignal: AbortSignal
): Promise<AxiosResponse<GetAllWishlistsServiceData>> {
  return axiosInstance.get('/wishlists/all', { signal: abortSignal });
}

type GetAllViewWishlistsServiceData = {
  wishlists: ViewWishlistDetails[];
  combinedWishlistsStatistics: CombinedWishlistsStatistics;
  ownerDetails: Omit<ViewWishlistOwnerDetails, 'owner_public_account_id'>;
};

export async function getAllViewWishlistsService(
  publicAccountId: string,
  abortSignal: AbortSignal
): Promise<AxiosResponse<GetAllViewWishlistsServiceData>> {
  return axiosInstance.get(`/wishlists/view/all/${publicAccountId}`, { signal: abortSignal });
}

type ChangeWishlistTitleServicePayload = {
  wishlistId: string;
  newTitle: string;
};

export async function changeWishlistTitleService(
  body: ChangeWishlistTitleServicePayload
): Promise<AxiosResponse> {
  return axiosInstance.patch('/wishlists/change/title', body);
}

type ChangeWishlistPrivacyLevelServicePayload = {
  wishlistId: string;
  newPrivacyLevel: number;
};

export async function changeWishlistPrivacyLevelService(
  body: ChangeWishlistPrivacyLevelServicePayload
): Promise<AxiosResponse> {
  return axiosInstance.patch('/wishlists/change/privacyLevel', body);
}

type SetWishlistFavoriteServicePayload = {
  wishlistId: string;
  newIsFavorited: boolean;
};

export async function setWishlistFavoriteService(
  body: SetWishlistFavoriteServicePayload
): Promise<AxiosResponse<SetWishlistFavoriteServicePayload>> {
  return axiosInstance.patch('/wishlists/change/favorite', body);
}

export async function deleteEmptyWishlistsService(): Promise<AxiosResponse> {
  return axiosInstance.delete('/wishlists/empty');
}

export async function deleteWishlistService(wishlistId: string): Promise<AxiosResponse> {
  return axiosInstance.delete(`/wishlists/${wishlistId}`);
}
