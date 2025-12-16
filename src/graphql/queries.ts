/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getLevel = /* GraphQL */ `query GetLevel($id: ID!) {
  getLevel(id: $id) {
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
` as GeneratedQuery<APITypes.GetLevelQueryVariables, APITypes.GetLevelQuery>;
export const listLevels = /* GraphQL */ `query ListLevels(
  $filter: ModelLevelFilterInput
  $limit: Int
  $nextToken: String
) {
  listLevels(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListLevelsQueryVariables,
  APITypes.ListLevelsQuery
>;
