import axios, { AxiosResponse } from 'axios';
import { FollowDetails, FollowRequest, SocialCounts } from '../types/socialTypes';

axios.defaults.withCredentials = true;
const socialApiUrl: string = location.hostname === 'localhost' ? `http://localhost:5000/api/social` : `https://muninnfy/api/social`;

type GetAccountSocialDetailsServiceData = {
  socialCounts: SocialCounts;
  followers: FollowDetails[];
  following: FollowDetails[];
  followRequests: FollowRequest[];
};

export function getAccountSocialDetailsService(abortSignal: AbortSignal): Promise<AxiosResponse<GetAccountSocialDetailsServiceData>> {
  return axios.get(socialApiUrl, { signal: abortSignal });
}

type SearchFollowersServiceData = {
  followersBatch: FollowDetails[];
};

export function searchFollowersService(
  searchQuery: string,
  offset: number,
  abortSignal: AbortSignal
): Promise<AxiosResponse<SearchFollowersServiceData>> {
  return axios.get(`${socialApiUrl}/followers/search?searchQuery=${searchQuery}&offset=${offset}`, { signal: abortSignal });
}

type GetFollowersBatchServiceData = {
  followersBatch: FollowDetails[];
};

export function getFollowersBatchService(offset: number): Promise<AxiosResponse<GetFollowersBatchServiceData>> {
  return axios.get(`${socialApiUrl}/followers/${offset}`);
}

type SearchFollowingServiceData = {
  followersBatch: FollowDetails[];
};

export function searchFollowingService(
  searchQuery: string,
  offset: number,
  abortSignal: AbortSignal
): Promise<AxiosResponse<SearchFollowingServiceData>> {
  return axios.get(`${socialApiUrl}/following/search?searchQuery=${searchQuery}&offset=${offset}`, { signal: abortSignal });
}

type GetFollowingBatchServiceData = {
  followersBatch: FollowDetails[];
};

export function getFollowingBatchService(offset: number): Promise<AxiosResponse<GetFollowingBatchServiceData>> {
  return axios.get(`${socialApiUrl}/following/${offset}`);
}

type SearchFollowRequestsServiceData = {
  followersBatch: FollowDetails[];
};

export function searchFollowRequestsService(
  searchQuery: string,
  offset: number,
  abortSignal: AbortSignal
): Promise<AxiosResponse<SearchFollowRequestsServiceData>> {
  return axios.get(`${socialApiUrl}/followRequests/search?searchQuery=${searchQuery}&offset=${offset}`, { signal: abortSignal });
}

type GetFollowRequestsBatchServiceData = {
  followersBatch: FollowRequest[];
};

export function getFollowRequestsBatchService(offset: number): Promise<AxiosResponse<GetFollowRequestsBatchServiceData>> {
  return axios.get(`${socialApiUrl}/followRequests/${offset}`);
}

type AcceptFollowRequestServicePayload = {
  requestId: number;
};

type AcceptFollowRequestServiceData = {
  follow_id: number;
  follow_timestamp: number;
};

export function acceptFollowRequestService(
  body: AcceptFollowRequestServicePayload
): Promise<AxiosResponse<AcceptFollowRequestServiceData>> {
  return axios.post(`${socialApiUrl}/followRequests/accept`, body);
}

export function declineFollowRequestService(requestId: number): Promise<AxiosResponse> {
  return axios.delete(`${socialApiUrl}/followRequests/decline/${requestId}`);
}

export function unfollowService(followId: number): Promise<AxiosResponse> {
  return axios.delete(`${socialApiUrl}/followers/unfollow/${followId}`);
}

export function removeFollowerService(followId: number): Promise<AxiosResponse> {
  return axios.delete(`${socialApiUrl}/followers/remove/${followId}`);
}
