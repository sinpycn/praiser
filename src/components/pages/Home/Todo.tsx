import * as React from 'react'
import { StyleSheet, Text, TouchableOpacity, TouchableHighlight, View } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import { useNavigation } from 'react-navigation-hooks'
import { SwipeRow } from 'react-native-swipe-list-view'
import analytics from '@react-native-firebase/analytics'
import Button from '../../../components/Button'
import { errorContext, userContext } from '../../../contexts'
import { DETAIL } from '../../../constants/path'
import * as Domain from '../../../domain/entities'
import { COLOR } from '../../../constants'

export interface Actions {
  removeTodo: (userId: string, id: string) => void
  toggleTodo: (userId: string, id: string) => void
}
export type State = Domain.Todo.Entity
interface Props {
  actions: Actions
  state: State
}

const styles = StyleSheet.create({
  contentContainer: {
    backgroundColor: COLOR.MAIN,
    height: 120,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  displayContent: {
    paddingHorizontal: 20,
  },
  leftButton: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLOR.PRIMARY,
    width: 80,
  },
  done: {
    backgroundColor: COLOR.MAIN_DARK,
  },
  rightButton: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLOR.RED,
    width: 80,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 32,
    color: COLOR.WHITE,
  },
  doneText: {
    textDecorationLine: 'line-through',
  },
  detail: {
    fontSize: 16,
    color: COLOR.WHITE,
  },
  detailButton: {
    width: 32,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
})

export default function Todo(props: Props) {
  const { userState } = React.useContext(userContext)
  const { navigate } = useNavigation()
  const rowRef = React.useRef<any>(null)
  const gotoDetail = React.useCallback(() => navigate(DETAIL, props.state), [navigate, props.state])
  const { setError } = React.useContext(errorContext)
  const toggleTodo = React.useCallback(async () => {
    try {
      props.actions.toggleTodo(userState.id, props.state.id)
      const eventName = props.state.completedAt === null ? 'complete_todo' : 'uncomplete_todo'
      await analytics().logEvent(eventName, {
        id: props.state.id,
        name: props.state.title,
      })
      rowRef.current.closeRow()
    } catch (error) {
      setError(error)
    }
  }, [props.actions, props.state.completedAt, props.state.id, props.state.title, setError, userState.id])
  const isDone = React.useMemo(() => {
    return !!props.state.completedAt
  }, [props.state.completedAt])

  return (
    <SwipeRow rightOpenValue={-80} leftOpenValue={80} ref={rowRef}>
      <View style={[styles.contentContainer]}>
        {isDone ? (
          <Button onPress={toggleTodo} icon="check" style={styles.leftButton} />
        ) : (
          <Button onPress={toggleTodo} icon="restore" style={[styles.leftButton, styles.done]} />
        )}
        <Button
          onPress={() => {
            props.actions.removeTodo(userState.id, props.state.id)
          }}
          icon="delete"
          style={styles.rightButton}
        />
      </View>
      <TouchableHighlight style={[styles.contentContainer, styles.displayContent]} onPress={gotoDetail}>
        <View style={styles.contentContainer}>
          <View>
            <Text style={[styles.title, !isDone ? styles.doneText : null]}>{props.state.title}</Text>
            {props.state.detail && <Text style={styles.detail}>{props.state.detail}</Text>}
          </View>
          <TouchableOpacity style={styles.detailButton} onPress={toggleTodo}>
            <Icon name="angle-right" size={32} color={COLOR.WHITE} />
          </TouchableOpacity>
        </View>
      </TouchableHighlight>
    </SwipeRow>
  )
}
