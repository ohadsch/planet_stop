/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createLevel = /* GraphQL */ `mutation CreateLevel(
  $input: CreateLevelInput!
  $condition: ModelLevelConditionInput
) {
  createLevel(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateLevelMutationVariables,
  APITypes.CreateLevelMutation
>;
export const updateLevel = /* GraphQL */ `mutation UpdateLevel(
  $input: UpdateLevelInput!
  $condition: ModelLevelConditionInput
) {
  updateLevel(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateLevelMutationVariables,
  APITypes.UpdateLevelMutation
>;
export const deleteLevel = /* GraphQL */ `mutation DeleteLevel(
  $input: DeleteLevelInput!
  $condition: ModelLevelConditionInput
) {
  deleteLevel(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteLevelMutationVariables,
  APITypes.DeleteLevelMutation
>;
