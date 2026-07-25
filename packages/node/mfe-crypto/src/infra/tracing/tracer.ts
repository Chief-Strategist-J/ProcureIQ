export const withTraceSpan = async (name: string, fn: (span: any) => any) => {
  const mockSpan = { setAttribute: () => {} };
  return await fn(mockSpan);
};
