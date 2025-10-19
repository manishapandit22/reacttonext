import { SceneGraphObject } from "@/interface";


type SceneGraphProps = {
  obj: SceneGraphObject | undefined | string,
  lines?: Array<string>,
  isLast: boolean | null,
  prefix?: string,
}

export default function getSceneGraph(props: SceneGraphProps) {
  const { obj, lines, isLast, prefix } = props;
  const localPrefix = isLast ? '└─' : '├─';
  
  lines.push(
    `${prefix}${prefix ? localPrefix : ''}${typeof obj === 'object' ? (obj?.name || '*no-name*') : obj} [${typeof obj === 'object' ? (obj?.type || 'unknown') : 'string'}]`
  );
  
  const newPrefix = prefix + (isLast ? '  ' : '│ ');
  
  if (obj && typeof obj === 'object' && 'children' in obj && Array.isArray(obj.children)) {
    const lastNdx = obj.children.length - 1;
    obj.children.forEach((child, ndx) => {
      const childIsLast = ndx === lastNdx;
      getSceneGraph({
        obj: child,
        lines,
        isLast: childIsLast,
        prefix: newPrefix
      });
    });
  }
  
  return lines;
}