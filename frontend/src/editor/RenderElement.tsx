import React from 'react';
import { RenderElementProps } from 'slate-react';
import { TElement, TNode } from '../../../shared';
import { CollectionEntry } from './elements/CollectionEntry';
import { Tag } from './elements/Tag';

export const RenderElement = (args: RenderElementProps) => {
  const { attributes, children } = args;
  const element: TNode = args.element as any;

  switch (element.type) {
    case 'heading': {
      let elt = `h${element.level}`;
      return React.createElement(elt, attributes, children);
    }
    case 'line':
      return <div {...attributes}>{children}</div>
    case 'tag':
      // 
      return <Tag {...args} />
    // return <div {...attributes}>{children}</div>
    default:
      return <div>this should never happen</div>
  }
}