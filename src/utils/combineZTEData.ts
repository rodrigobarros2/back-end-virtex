export interface OntInfo {
  slot: string;
  port: string;
  ont_id: string;
  state: string;
  sn: string;
  olt_type: string;
}

export const combineZTEData = (stateData: OntInfo[], snData: OntInfo[]) => {
  const combinedData = stateData.map((stateItem) => {
    const snItem = snData.find(
      (snItem) =>
        snItem.slot === stateItem.slot &&
        snItem.port === stateItem.port &&
        snItem.ont_id === stateItem.ont_id &&
        snItem.olt_type === stateItem.olt_type
    );
    return {
      ...stateItem,
      state: stateItem.state,
      sn: snItem ? snItem.sn : stateItem.sn,
    };
  });

  return combinedData;
};
