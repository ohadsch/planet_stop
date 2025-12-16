/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateLevelInput = {
  id?: string | null,
  name: string,
  description?: string | null,
  authorName?: string | null,
  accel: number,
  rollingResistance: number,
  brakeDecel: number,
  initialSpeed: number,
  backgroundColor: string,
  groundColor: number,
  elevationProfile: string,
  slopeZones: string,
  playCount: number,
};

export type ModelLevelConditionInput = {
  name?: ModelStringInput | null,
  description?: ModelStringInput | null,
  authorName?: ModelStringInput | null,
  accel?: ModelFloatInput | null,
  rollingResistance?: ModelFloatInput | null,
  brakeDecel?: ModelFloatInput | null,
  initialSpeed?: ModelFloatInput | null,
  backgroundColor?: ModelStringInput | null,
  groundColor?: ModelIntInput | null,
  elevationProfile?: ModelStringInput | null,
  slopeZones?: ModelStringInput | null,
  playCount?: ModelIntInput | null,
  and?: Array< ModelLevelConditionInput | null > | null,
  or?: Array< ModelLevelConditionInput | null > | null,
  not?: ModelLevelConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type ModelFloatInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type ModelIntInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type Level = {
  __typename: "Level",
  id: string,
  name: string,
  description?: string | null,
  authorName?: string | null,
  accel: number,
  rollingResistance: number,
  brakeDecel: number,
  initialSpeed: number,
  backgroundColor: string,
  groundColor: number,
  elevationProfile: string,
  slopeZones: string,
  playCount: number,
  createdAt: string,
  updatedAt: string,
};

export type UpdateLevelInput = {
  id: string,
  name?: string | null,
  description?: string | null,
  authorName?: string | null,
  accel?: number | null,
  rollingResistance?: number | null,
  brakeDecel?: number | null,
  initialSpeed?: number | null,
  backgroundColor?: string | null,
  groundColor?: number | null,
  elevationProfile?: string | null,
  slopeZones?: string | null,
  playCount?: number | null,
};

export type DeleteLevelInput = {
  id: string,
};

export type ModelLevelFilterInput = {
  id?: ModelIDInput | null,
  name?: ModelStringInput | null,
  description?: ModelStringInput | null,
  authorName?: ModelStringInput | null,
  accel?: ModelFloatInput | null,
  rollingResistance?: ModelFloatInput | null,
  brakeDecel?: ModelFloatInput | null,
  initialSpeed?: ModelFloatInput | null,
  backgroundColor?: ModelStringInput | null,
  groundColor?: ModelIntInput | null,
  elevationProfile?: ModelStringInput | null,
  slopeZones?: ModelStringInput | null,
  playCount?: ModelIntInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelLevelFilterInput | null > | null,
  or?: Array< ModelLevelFilterInput | null > | null,
  not?: ModelLevelFilterInput | null,
};

export type ModelIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export type ModelLevelConnection = {
  __typename: "ModelLevelConnection",
  items:  Array<Level | null >,
  nextToken?: string | null,
};

export type ModelSubscriptionLevelFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  name?: ModelSubscriptionStringInput | null,
  description?: ModelSubscriptionStringInput | null,
  authorName?: ModelSubscriptionStringInput | null,
  accel?: ModelSubscriptionFloatInput | null,
  rollingResistance?: ModelSubscriptionFloatInput | null,
  brakeDecel?: ModelSubscriptionFloatInput | null,
  initialSpeed?: ModelSubscriptionFloatInput | null,
  backgroundColor?: ModelSubscriptionStringInput | null,
  groundColor?: ModelSubscriptionIntInput | null,
  elevationProfile?: ModelSubscriptionStringInput | null,
  slopeZones?: ModelSubscriptionStringInput | null,
  playCount?: ModelSubscriptionIntInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionLevelFilterInput | null > | null,
  or?: Array< ModelSubscriptionLevelFilterInput | null > | null,
};

export type ModelSubscriptionIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionFloatInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  in?: Array< number | null > | null,
  notIn?: Array< number | null > | null,
};

export type ModelSubscriptionIntInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  in?: Array< number | null > | null,
  notIn?: Array< number | null > | null,
};

export type CreateLevelMutationVariables = {
  input: CreateLevelInput,
  condition?: ModelLevelConditionInput | null,
};

export type CreateLevelMutation = {
  createLevel?:  {
    __typename: "Level",
    id: string,
    name: string,
    description?: string | null,
    authorName?: string | null,
    accel: number,
    rollingResistance: number,
    brakeDecel: number,
    initialSpeed: number,
    backgroundColor: string,
    groundColor: number,
    elevationProfile: string,
    slopeZones: string,
    playCount: number,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateLevelMutationVariables = {
  input: UpdateLevelInput,
  condition?: ModelLevelConditionInput | null,
};

export type UpdateLevelMutation = {
  updateLevel?:  {
    __typename: "Level",
    id: string,
    name: string,
    description?: string | null,
    authorName?: string | null,
    accel: number,
    rollingResistance: number,
    brakeDecel: number,
    initialSpeed: number,
    backgroundColor: string,
    groundColor: number,
    elevationProfile: string,
    slopeZones: string,
    playCount: number,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteLevelMutationVariables = {
  input: DeleteLevelInput,
  condition?: ModelLevelConditionInput | null,
};

export type DeleteLevelMutation = {
  deleteLevel?:  {
    __typename: "Level",
    id: string,
    name: string,
    description?: string | null,
    authorName?: string | null,
    accel: number,
    rollingResistance: number,
    brakeDecel: number,
    initialSpeed: number,
    backgroundColor: string,
    groundColor: number,
    elevationProfile: string,
    slopeZones: string,
    playCount: number,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type GetLevelQueryVariables = {
  id: string,
};

export type GetLevelQuery = {
  getLevel?:  {
    __typename: "Level",
    id: string,
    name: string,
    description?: string | null,
    authorName?: string | null,
    accel: number,
    rollingResistance: number,
    brakeDecel: number,
    initialSpeed: number,
    backgroundColor: string,
    groundColor: number,
    elevationProfile: string,
    slopeZones: string,
    playCount: number,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListLevelsQueryVariables = {
  filter?: ModelLevelFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListLevelsQuery = {
  listLevels?:  {
    __typename: "ModelLevelConnection",
    items:  Array< {
      __typename: "Level",
      id: string,
      name: string,
      description?: string | null,
      authorName?: string | null,
      accel: number,
      rollingResistance: number,
      brakeDecel: number,
      initialSpeed: number,
      backgroundColor: string,
      groundColor: number,
      elevationProfile: string,
      slopeZones: string,
      playCount: number,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type OnCreateLevelSubscriptionVariables = {
  filter?: ModelSubscriptionLevelFilterInput | null,
};

export type OnCreateLevelSubscription = {
  onCreateLevel?:  {
    __typename: "Level",
    id: string,
    name: string,
    description?: string | null,
    authorName?: string | null,
    accel: number,
    rollingResistance: number,
    brakeDecel: number,
    initialSpeed: number,
    backgroundColor: string,
    groundColor: number,
    elevationProfile: string,
    slopeZones: string,
    playCount: number,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateLevelSubscriptionVariables = {
  filter?: ModelSubscriptionLevelFilterInput | null,
};

export type OnUpdateLevelSubscription = {
  onUpdateLevel?:  {
    __typename: "Level",
    id: string,
    name: string,
    description?: string | null,
    authorName?: string | null,
    accel: number,
    rollingResistance: number,
    brakeDecel: number,
    initialSpeed: number,
    backgroundColor: string,
    groundColor: number,
    elevationProfile: string,
    slopeZones: string,
    playCount: number,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteLevelSubscriptionVariables = {
  filter?: ModelSubscriptionLevelFilterInput | null,
};

export type OnDeleteLevelSubscription = {
  onDeleteLevel?:  {
    __typename: "Level",
    id: string,
    name: string,
    description?: string | null,
    authorName?: string | null,
    accel: number,
    rollingResistance: number,
    brakeDecel: number,
    initialSpeed: number,
    backgroundColor: string,
    groundColor: number,
    elevationProfile: string,
    slopeZones: string,
    playCount: number,
    createdAt: string,
    updatedAt: string,
  } | null,
};
