/* arche rev: 2f5d48eac375466f8fb4cb48f526d92bb36b4a56 (modified) */
/*
 * arche is a two-file React component library. It is intended to be copied (or symlinked)
 * directly into projects.
 * 
 * Its styling is derived heavily from BlueprintJS and it is a derivative work.
 * See: https://github.com/palantir/blueprint/blob/develop/LICENSE
 */

import { createElement } from 'react';

/**
 * Converts an array to space-separated strings, if it is an array.
 * Used for example for padding 'p1' => 'a-p1', ['px1', 'py2'] => 'a-px1 a-py2'
 */
export const arrayToString = (x: ReadonlyArray<string> | string | undefined, prepend?: string) =>
  Array.isArray(x) ?
    (prepend ? x.map(x => `${prepend}-${x}`) : x).join(' ') : ((prepend && x) ? `${prepend}-${x}` : x);

/**
 * Handle props common to most components
 */
const commonClassProps = (className: string, props: any) => {
  const classNames = [
    className,
    props.className && props.className,
    props.intent && `a-intent-${props.intent}`,
    props.flex && arrayToString(props.flex, 'a'),
    props.margin && arrayToString(props.margin, 'a'),
    props.padding && arrayToString(props.padding, 'a'),
  ];

  return classNames.join(' ');
}

const classNames = (...args: ReadonlyArray<string | false | undefined | null>) => args.reduce((a, b) => `${a}${b ? ` ${b}` : ''}`) || '';

/**
 * List of props to not pass through to HTML elements, to avoid warnings
 */
const excludeProps: { [key: string]: true } = {
  children: true,
  flex: true,
  minimal: true,
  outline: true,
}

/**
 * Creates an atomic element, passing through any props 
 * (except typed styling props)
 * @param elementType type of element (button, div etc)
 * @param className classnames to always pass to classname
 * @param props props of element
 */
const createAtom = (elementType: string, className: string, props: any) => {
  const nonStylePropsKeys = Object.keys(props);
  const nonStyleProps: any = {};

  nonStylePropsKeys.forEach(k => {
    if (excludeProps[k]) return;
    nonStyleProps[k] = props[k];
  });

  return createElement(elementType, {
    ...nonStyleProps,
    className: commonClassProps(className, props).trim(),
  }, props.children);
}

type FlexConstants = 'justify-center' | 'column' | 'items-center' | 'row';
type PaddingConstants = 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'pl1' | 'pl2' | 'pl3' | 'pl4' | 'pl5' | 'pr1' | 'pr2' | 'pr3' | 'pr4' | 'pr5' | 'pt1' | 'pt2' | 'pt3' | 'pt4' | 'pt5' | 'pb1' | 'pb2' | 'pb3' | 'pb4' | 'pb5' | 'px1' | 'px2' | 'px3' | 'px4' | 'px5' | 'py1' | 'py2' | 'py3' | 'py4' | 'py5';
type MarginConstants = 'm1' | 'm2' | 'm3' | 'm4' | 'm5' | 'ml1' | 'ml2' | 'ml3' | 'ml4' | 'ml5' | 'mr1' | 'mr2' | 'mr3' | 'mr4' | 'mr5' | 'mt1' | 'mt2' | 'mt3' | 'mt4' | 'mt5' | 'mb1' | 'mb2' | 'mb3' | 'mb4' | 'mb5' | 'mx1' | 'mx2' | 'mx3' | 'mx4' | 'mx5' | 'my1' | 'my2' | 'my3' | 'my4' | 'my5';
type Intent = 'primary' | 'secondary' | 'warning' | 'danger';

type FlexProps = FlexConstants | ReadonlyArray<FlexConstants>;
type PaddingProps = PaddingConstants | ReadonlyArray<PaddingConstants>;
type MarginProps = MarginConstants | ReadonlyArray<MarginConstants>;

interface AtomProps {
  flex?: FlexProps;
  padding?: PaddingProps;
  margin?: MarginProps;
}

interface IntentProps {
  intent?: Intent;
};

interface _ButtonProps {
  minimal?: boolean;
  outline?: boolean;
}

export type ButtonProps = AtomProps & React.HTMLProps<HTMLButtonElement> & _ButtonProps & IntentProps;

/**
 * A button
 * @param props 
 */
export const Button = (props: ButtonProps) => {
  return createAtom('button', classNames('a-Button a-py1 a-px2', props.minimal && `a-Button-minimal`, props.outline && `a-Button-outline`), props);
}

type ButtonLinkProps = AtomProps & React.HTMLProps<HTMLAnchorElement> & _ButtonProps;

export const ButtonLink = (props: ButtonLinkProps) => {
  return createAtom('a', classNames('a-Link a-Button a-py1 a-px2', props.minimal && `a-Button-minimal`, props.outline && `a-Button-outline`), props);
}

type RaisedProps = AtomProps & React.HTMLProps<HTMLDivElement>;

export const Raised = (props: RaisedProps) => {
  return createAtom('div', 'a-Raised a-flex', props);
}

type CalloutProps = AtomProps & React.HTMLProps<HTMLDivElement> & IntentProps;

export const Callout = (props: CalloutProps) => {
  return createAtom('div', 'a-Callout a-p3', props);
}

type BoxProps = AtomProps & React.HTMLProps<HTMLDivElement>;

export const Box = (props: BoxProps) => {
  return createAtom('div', 'a-Box', props);
}

type GroupProps = AtomProps & React.HTMLProps<HTMLDivElement> & {
  direction?: 'row' | 'column';
  spacing?: 1 | 2 | 3 | 4 | 5;
};

/**
 * Group with spacing
 * @param props 
 */
export const Group = ({ spacing = 1, direction, ...props }: GroupProps) => {
  return createAtom('div', classNames(`a-flex a-Group a-Group-${direction || 'row'} a-Group-spacing-${spacing}`), props);
}

// TODO: Spinner
// TODO: Toast
// TODO: Loading