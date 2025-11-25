// server/types/next-shim.d.ts
declare type PromiseWithResolvers<T> = Promise<T> & {
  resolve: (value: T) => void;
  reject: (reason?: any) => void;
};
