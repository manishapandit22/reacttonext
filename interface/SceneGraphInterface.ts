export default interface SceneGraphObject {
  name?: string;
  type?: string;
  children?: SceneGraphObject[];
}