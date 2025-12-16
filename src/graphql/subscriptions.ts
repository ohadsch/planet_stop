/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateLevel = /* GraphQL */ `subscription OnCreateLevel($filter: ModelSubscriptionLevelFilterInput) {
  onCreateLevel(filter: $filter) {
    id
    name
    description
    authorName
    accel
    rollingResistance
    brakeDecel
    initialSpeed
    backgroundColor
    groundColor
    elevationProfile
    slopeZones
    playCount
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateLevelSubscriptionVariables,
  APITypes.OnCreateLevelSubscription
>;
export const onUpdateLevel = /* GraphQL */ `subscription OnUpdateLevel($filter: ModelSubscriptionLevelFilterInput) {
  onUpdateLevel(filter: $filter) {
    id
    name
    description
    authorName
    accel
    rollingResistance
    brakeDecel
    initialSpeed
    backgroundColor
    groundColor
    elevationProfile
    slopeZones
    playCount
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateLevelSubscriptionVariables,
  APITypes.OnUpdateLevelSubscription
>;
export const onDeleteLevel = /* GraphQL */ `subscription OnDeleteLevel($filter: ModelSubscriptionLevelFilterInput) {
  onDeleteLevel(filter: $filter) {
    id
    name
    description
    authorName
    accel
    rollingResistance
    brakeDecel
    initialSpeed
    backgroundColor
    groundColor
    elevationProfile
    slopeZones
    playCount
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteLevelSubscriptionVariables,
  APITypes.OnDeleteLevelSubscription
>;
