import axios, { AxiosResponse } from 'axios';
import { WishlistItemType } from '../types/wishlistItemTypes';

axios.defaults.withCredentials = true;
const wishlistItemsApiUrl: string =
  location.hostname === 'localhost' ? `http://localhost:5000/api/wishlistItems` : `https://muninnfy/api/wishlistItems`;

type AddWishlistItemServicePayload = {
  wishlistId: string;
  title: string;
  description: string | null;
  link: string | null;
  tags: string[];
};

export async function addWishlistItemService(body: AddWishlistItemServicePayload): Promise<AxiosResponse<WishlistItemType>> {
  return axios.post(wishlistItemsApiUrl, body);
}

type EditWishlistItemServicePayload = {
  wishlistId: string;
  itemId: number;
  title: string;
  description: string | null;
  link: string | null;
  tags: string[];
};

export async function editWishlistItemService(body: EditWishlistItemServicePayload): Promise<AxiosResponse<WishlistItemType>> {
  return axios.patch(wishlistItemsApiUrl, body);
}

export async function deleteWishlistItemService(wishlistId: string, itemId: number): Promise<AxiosResponse> {
  return axios.delete(`${wishlistItemsApiUrl}?wishlistId=${wishlistId}&itemId=${itemId}`);
}

type BulkDeleteWishlistItemsServicePayload = {
  wishlistId: string;
  itemsIdArr: number[];
};

type BulkDeleteWishlistItemsServiceData = {
  deletedItemsCount: number;
};

export async function bulkDeleteWishlistItemsService(
  body: BulkDeleteWishlistItemsServicePayload
): Promise<AxiosResponse<BulkDeleteWishlistItemsServiceData>> {
  return axios.delete(`${wishlistItemsApiUrl}/bulk`, { data: body });
}

type SetWishlistItemIsPurchasedServicePayload = {
  wishlistId: string;
  itemId: number;
  markAsPurchased: boolean;
};

type SetWishlistItemIsPurchasedServiceData = {
  newPurchasedOnTimestamp: number | null;
};

export async function setWishlistItemIsPurchasedService(
  body: SetWishlistItemIsPurchasedServicePayload
): Promise<AxiosResponse<SetWishlistItemIsPurchasedServiceData>> {
  return axios.patch(`${wishlistItemsApiUrl}/purchaseStatus`, body);
}

type BulkSetWishlistItemIsPurchasedService = {
  wishlistId: string;
  itemsIdArr: number[];
  markAsPurchased: boolean;
};

type BulkSetWishlistItemIsPurchasedData = {
  newPurchasedOnTimestamp: number | null;
  updatedItemsCount: number;
};

export async function bulkSetWishlistItemIsPurchasedService(
  body: BulkSetWishlistItemIsPurchasedService
): Promise<AxiosResponse<BulkSetWishlistItemIsPurchasedData>> {
  return axios.patch(`${wishlistItemsApiUrl}/purchaseStatus/bulk`, body);
}
