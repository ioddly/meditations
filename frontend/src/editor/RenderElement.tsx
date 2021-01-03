import React from 'react';
import { RenderElementProps } from 'slate-react';
import { TNode } from '../../../shared';
import { At } from './elements/At';
import { AtTypeSelect } from './elements/AtTypeSelect';
import { Tag } from './elements/Tag';

export const RenderElement = (args: RenderElementProps) => {
  const { attributes, children } = args;
  const element: TNode = args.element as any;

  if (!('type' in element)) return <div>this should never happen</div>;

  switch (element.type) {
    case 'heading': {
      let elt = `h${element.level}`;
      return React.createElement(elt, attributes, children);
    }
    case 'line':
      return <div {...attributes}>{children}</div>
    case 'at_type_select':
      return <AtTypeSelect {...args}>{children}</AtTypeSelect>
    case 'at':
      return <At {...args}>{children}</At>
    case 'tag':
      return <Tag {...args} />
    default:
      return <div>this should never happen</div>
  }
}