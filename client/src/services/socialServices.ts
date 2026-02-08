import axios, { AxiosResponse } from 'axios';
import { BasicSocialData, FollowDetails, FollowRequest, SocialCounts, SocialSectionType } from '../types/socialTypes';

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

export function getSocialBatchService(type: 'followers' | 'following', offset: number): Promise<AxiosResponse<FollowDetails[]>>;
export function getSocialBatchService(type: 'followRequests', offset: number): Promise<AxiosResponse<FollowRequest[]>>;
export function getSocialBatchService(type: SocialSectionType, offset: number): Promise<AxiosResponse<FollowDetails[] | FollowRequest[]>> {
  return axios.get(`${socialApiUrl}/${type}/${offset}`);
}

export function searchSocialService(
  type: 'followers' | 'following',
  searchQuery: string,
  offset: number,
  abortSignal: AbortSignal
): Promise<AxiosResponse<FollowDetails[]>>;

export function searchSocialService(
  type: 'followRequests',
  searchQuery: string,
  offset: number,
  abortSignal: AbortSignal
): Promise<AxiosResponse<FollowRequest[]>>;

export function searchSocialService(
  type: SocialSectionType,
  searchQuery: string,
  offset: number,
  abortSignal: AbortSignal
): Promise<AxiosResponse<FollowDetails[] | FollowRequest[]>> {
  return axios.get(`${socialApiUrl}/${type}/search`, {
    params: { searchQuery, offset },
    signal: abortSignal,
  });
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

export function findAccountsService(searchQuery: string): Promise<AxiosResponse<BasicSocialData[]>> {
  return axios.get(`${socialApiUrl}/find/${searchQuery}`);
}
