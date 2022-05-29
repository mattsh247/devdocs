class app.views.Notice extends app.View
  @className: '_notice'
  @attributes:
    role: 'alert'

  constructor: (@type, @args...) -> super(arguments)

  init: ->
    @activate()
    return

  activate: ->
    @show() if super.activate()
    return

  deactivate: ->
    @hide() if super.deactivate()
    return

  show: ->
    @html @tmpl("#{@type}Notice", @args...)
    @prependTo app.el
    return

  hide: ->
    $.remove @el
    return
