import { AxiosResponse } from 'axios';
import axiosInstance from './axiosInstance';
import { WishlistItemType } from '../types/wishlistItemTypes';

type AddWishlistItemServicePayload = {
  wishlistId: string;
  title: string;
  description: string | null;
  link: string | null;
  price: number | null;
  tags: string[];
};

export async function addWishlistItemService(body: AddWishlistItemServicePayload): Promise<AxiosResponse<WishlistItemType>> {
  return axiosInstance.post('/wishlistItems', body);
}

type EditWishlistItemServicePayload = {
  wishlistId: string;
  itemId: number;
  title: string;
  description: string | null;
  link: string | null;
  price: number | null;
  tags: string[];
};

export async function editWishlistItemService(body: EditWishlistItemServicePayload): Promise<AxiosResponse<WishlistItemType>> {
  return axiosInstance.patch('/wishlistItems', body);
}

export async function deleteWishlistItemService(wishlistId: string, itemId: number): Promise<AxiosResponse> {
  return axiosInstance.delete('/wishlistItems', { params: { wishlistId, itemId } });
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
  return axiosInstance.delete('/wishlistItems/bulk', { data: body });
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
  return axiosInstance.patch('/wishlistItems/purchaseStatus', body);
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
  return axiosInstance.patch('/wishlistItems/purchaseStatus/bulk', body);
}
