import React, { useEffect, useRef, useMemo } from 'react'
import { connect } from 'react-redux'
import AceEditor from 'react-ace'
import { WithContext as Tags } from 'react-tag-input'

import 'brace/theme/textmate'

import Notification from './common/Notification'
import ListBoxWithSearch from './ListBoxWithSearch'

import { fetchSyntaxes, postSnippet } from '../actions'

import { onEditorLoad } from '../misc/editor'
import { getCurrentModeName, getModesByName } from '../misc/modes'

import {
  validateSnippet,
  delimeterKeys,
  defaultOptions,
  categories,
  actions,
} from '../entries'

import useReactGA from '../hooks/useReactGA'
import useForm from '../hooks/useForm'

import '../styles/NewSnippet.styl'

const NewSnippet = ({ dispatch, history, syntaxes }) => {
  const snippetHeader = useRef()
  const { gaEvent } = useReactGA()
  const {
    values: { title = '', syntax = '', content = '', tags = [] },
    error,
    handleChange,
    handleSubmit,
  } = useForm(post, validate)

  useEffect(() => {
    dispatch(fetchSyntaxes)
  }, [])

  useEffect(() => {
    recalcLangHeaderHeight()
  }, [tags])

  function validate() {
    return validateSnippet({ content: content.trim() })
  }

  function post() {
    const snippet = {
      content,
      title,
      tags: tags.map(tag => tag.text),
      syntax,
    }

    gaEvent({ category: categories.SNIPPET, action: actions.SNIPPET_CREATED, value: snippet })

    dispatch(postSnippet({ ...snippet }, json => history.push(`/${json.id}`)))
  }

  const recalcLangHeaderHeight = () => {
    const height = snippetHeader.current.offsetHeight

    document.getElementsByClassName('new-snippet-lang-header')[0]
      .setAttribute('style', `height:${height}px`)
  }

  const onTagBlur = tag => onTagAdded({ id: tag, text: tag })

  const onTagAdded = tag => {
    if (tag && tag.text) {
      return { tags: [...tags, tag] }
    }
  }

  const onTagRemoved = i => {
    return { tags: tags.filter((tag, index) => index !== i) }
  }

  const handleSyntax = syntax => ({ syntax })
  const handleContent = content => ({ content })

  const memoizedSyntaxes = useMemo(() => {
    const { modesByName } = getModesByName()

    return syntaxes.map(item => ({
      name: modesByName[item].caption,
      value: item,
    }))
  }, [syntaxes])

  const renderValidationError = () => (error && <Notification message={error} />)

  return (
    <form
      className="new-snippet"
      key="New Snippet"
      onSubmit={handleSubmit}
      role="presentation"
    >
      <div className="new-snippet-code-wrapper">
        <div className="new-snippet-code-header" ref={snippetHeader}>
          <input
            className="input"
            placeholder="Title"
            name="title"
            type="text"
            value={title}
            onChange={handleChange}
          />
          <Tags
            placeholder="Tags"
            tags={tags}
            handleDelete={(value) => handleChange(value, onTagRemoved)}
            handleAddition={(value) => handleChange(value, onTagAdded)}
            handleInputBlur={(value) => handleChange(value, onTagBlur)}
            delimiters={delimeterKeys}
          />
        </div>
        <div className="new-snippet-code">
          <AceEditor
            mode={getCurrentModeName(syntax)}
            width="100%"
            height="100%"
            focus
            theme="textmate"
            onLoad={onEditorLoad}
            setOptions={defaultOptions}
            editorProps={{ $blockScrolling: Infinity }}
            value={content}
            onChange={(value) => handleChange(value, handleContent)}
          />
          <div className="new-snippet-code-bottom-bar">
            {renderValidationError()}
            <input type="submit" value="POST SNIPPET" />
          </div>
        </div>
      </div>
      <div className="new-snippet-lang-wrapper">
        <ListBoxWithSearch
          items={memoizedSyntaxes}
          onClick={(syntax) => handleChange(syntax, handleSyntax)}
        />
      </div>
    </form>
  )
}

export default connect(state => ({
  syntaxes: state.get('syntaxes'),
}))(NewSnippet)
