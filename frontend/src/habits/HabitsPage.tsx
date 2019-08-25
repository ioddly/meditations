import React from 'react';
import { format, parse } from 'date-fns';
import { View } from '@upvalueio/third-coast';

import { ScopeDays } from './ScopeDays';
import { TasksByDateRequest } from '../api';
import { TaskDragDropContext } from './TaskDragDropContext';
import { TimeNavigator } from './TimeNavigator';
import { Scope } from './Scope';


export interface HabitsPageProps {
  date: string;
  tasks: TasksByDateRequest['tasksByDate'] | null;
}

const baseDate = new Date();

export const HabitsPage = (props: HabitsPageProps) => {
  const { tasks, date } = props;

  const dateObj = parse(date, 'yyyy-MM', baseDate);

  return (
    <>
      <TaskDragDropContext>
        <main className="HabitsPage m3 flex-column flex flex-auto">
          <View flex={["flex", "flex-column"]}>

            <View flex={["flex", "justify-around"]}>
              <h1>Meditations</h1>
            </View>

            <View flex={["flex", "justify-around"]}>
              <TimeNavigator date={date} />
            </View>

          </View>

          <View flex={["flex", "justify-around"]}>
            <View className="higher-scopes" flex="flex">
              {tasks &&
                <>

                  <ScopeDays
                    date={dateObj}
                    tasks={tasks.Days}
                  />

                  <Scope
                    className="mx3"
                    title={format(dateObj, 'MMMM')}
                    date={format(dateObj, 'yyyy-MM')}
                    tasks={tasks.Month}
                  />

                  <Scope
                    title={format(dateObj, 'yyyy')}
                    date={format(dateObj, 'yyyy')}
                    tasks={tasks.Year}
                  />
                </>
              }
            </View>
          </View>
        </main>
      </TaskDragDropContext>
    </>
  );
};
