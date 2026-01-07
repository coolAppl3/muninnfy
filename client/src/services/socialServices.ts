import axios, { AxiosResponse } from 'axios';
import { FollowDetails, FollowRequest } from '../types/socialTypes';

axios.defaults.withCredentials = true;
const socialApiUrl: string = location.hostname === 'localhost' ? `http://localhost:5000/api/social` : `https://muninnfy/api/social`;

type GetAccountSocialDetailsServiceData = {
  followers: FollowDetails[];
  following: FollowDetails[];
  followRequests: FollowRequest[];
};

export function getAccountSocialDetailsService(abortSignal: AbortSignal): Promise<AxiosResponse<GetAccountSocialDetailsServiceData>> {
  return axios.get(socialApiUrl, { signal: abortSignal });
}

type GetFollowersBatchServiceData = {
  followersBatch: FollowDetails[];
};

export function getFollowersBatchService(offset: number): Promise<AxiosResponse<GetFollowersBatchServiceData>> {
  return axios.get(`${socialApiUrl}/followers/${offset}`);
}

type GetFollowingBatchServiceData = {
  followersBatch: FollowDetails[];
};

export function getFollowingBatchService(offset: number): Promise<AxiosResponse<GetFollowingBatchServiceData>> {
  return axios.get(`${socialApiUrl}/following/${offset}`);
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
