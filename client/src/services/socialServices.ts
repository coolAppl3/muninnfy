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

type FollowDetailsBatch = {
  batch: FollowDetails[];
};

export function searchFollowersService(
  searchQuery: string,
  offset: number,
  abortSignal: AbortSignal
): Promise<AxiosResponse<FollowDetailsBatch>> {
  return axios.get(`${socialApiUrl}/followers/search`, {
    params: { searchQuery, offset },
    signal: abortSignal,
  });
}

export function getFollowersBatchService(offset: number): Promise<AxiosResponse<FollowDetailsBatch>> {
  return axios.get(`${socialApiUrl}/followers/${offset}`);
}

export function searchFollowingService(
  searchQuery: string,
  offset: number,
  abortSignal: AbortSignal
): Promise<AxiosResponse<FollowDetailsBatch>> {
  return axios.get(`${socialApiUrl}/following/search`, {
    params: { searchQuery, offset },
    signal: abortSignal,
  });
}

export function getFollowingBatchService(offset: number): Promise<AxiosResponse<FollowDetailsBatch>> {
  return axios.get(`${socialApiUrl}/following/${offset}`);
}

type FollowRequestsBatch = {
  batch: FollowRequest[];
};

export function searchFollowRequestsService(
  searchQuery: string,
  offset: number,
  abortSignal: AbortSignal
): Promise<AxiosResponse<FollowRequestsBatch>> {
  return axios.get(`${socialApiUrl}/followRequests/search`, {
    params: { searchQuery, offset },
    signal: abortSignal,
  });
}

export function getFollowRequestsBatchService(offset: number): Promise<AxiosResponse<FollowRequestsBatch>> {
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
