export interface Transformation<T, R> {
  transform(data: T): Promise<R>;
}
