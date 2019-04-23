// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * @package     atto_lti
 * @copyright   2018 The Regents of the University of California
 * @license     GPL v3
 */

/**
 * @module moodle-atto_lti-button
 */

/**
 * Atto text editor LTI activities plugin
 *
 * @namespace M.atto_lti
 * @class     Button
 * @extends   M.editor_atto.EditorPlugin
 */


Y.namespace('M.atto_lti').PlacementStrategyFactory = function () {

    this.strategyFor = function (item, course, resourceLinkId, tool) {

        var StrategyClass = Y.M.atto_lti.EmbeddedContentRenderingStrategy;

        if (item.mediaType === 'application/vnd.ims.lti.v1.ltilink'
                || item.placementAdvice) {
            StrategyClass = Y.M.atto_lti.IframeRenderingStrategy;

            if (item.placementAdvice) {

                switch (item.placementAdvice.presentationDocumentTarget) {
                    case 'window':
                    case 'popup':
                    case 'overlay':
                        StrategyClass = Y.M.atto_lti.PlaceholderRenderingStrategy;
                        break;
                    case 'iframe':
                        StrategyClass = Y.M.atto_lti.IframeRenderingStrategy;
                        break;
                    case 'embed':
                    case 'frame':
                        StrategyClass = Y.M.atto_lti.EmbeddedContentRenderingStrategy;
                        break;
                    default:
                        alert('Unsupported presentation target: '
                                + item.placementAdvice.presentationDocumentTarget);
                        break;
                }
            }
        }

        var strategy = new StrategyClass(item, course, resourceLinkId, tool);

        return strategy;
    };
};

Y.namespace('M.atto_lti').EmbeddedContentRenderingStrategy = function (item,
        course, resourceLinkId, tool) {

    var mimeTypePieces = item.mediaType.split('/'),
        mimeTypeType = mimeTypePieces[0],
        defaultWidth = "400px",
        defaultHeight = "250px",
        defaultThumbnailWidth = 128,
        defaultThumbnailHeight = 72,
        titleWidth = defaultWidth,
        titleHeight = defaultThumbnailHeight,
        textHeight = (parseInt(defaultHeight) - parseInt(defaultThumbnailHeight)) + "px",
        TEMPLATES,
        content;

    // Some extra math so the handlebars does not need to do the same math or redundant if checks. 
    if (!item.displayWidth) {
        item.displayWidth = defaultWidth;
    }

    if (!item.displayHeight) {
        item.displayHeight = defaultHeight;
    }

    if (item.thumbnail) {
        if (!item.thumbnail.width) {
            item.thumbnail.width = defaultThumbnailWidth;
        }

        if (!item.thumbnail.height) {
            item.thumbnail.height = defaultThumbnailHeight;
        }

        // The extra 5px is for a margin to the right of the thumbnail
        titleWidth = (parseInt(item.displayWidth) - parseInt(item.thumbnail.width) - 5) + "px";
        titleHeight = parseInt(item.thumbnail.height) + "px";
    }

    // In this case there is no text/html being sent, just a title and possible thumbnail, reduce height.
    if (!item.text) {
        defaultHeight = defaultThumbnailHeight;
    }


    TEMPLATES = {
        image: Y.Handlebars.compile('<img src="{{url}}" alt="{{alt}}" '
            + '{{#if width}}width="{{width}}" {{/if}}'
            + '{{#if height}}height="{{height}}" {{/if}}'
            + '{{#if presentation}}role="presentation" {{/if}}'
            + '{{#if customstyle}}style="{{customstyle}}" {{/if}}'
            + '{{#if classlist}}class="{{classlist}}" {{/if}}'
            + '{{#if id}}id="{{id}}" {{/if}} />'
        ),
        ltiLink: Y.Handlebars.compile('<iframe src="/lib/editor/atto/plugins/lti/view.php?custom={{custom}}&'
            + 'course={{course.id}}&ltitypeid={{toolid}}&resourcelinkid={{resourcelinkid}}'
            + '{{#if item.url}}&contenturl={{item.url}}{{/if}}'
            + '" '
            + '{{#if item.placementAdvice.width}} width="{{item.placementAdvice.displayWidth}}"{{/if}} '
            + '{{#if item.placementAdvice.height}} height="{{item.placementAdvice.displayHeight}}"{{/if}} '
            + '/>'
        ),
        audio: Y.Handlebars.compile('<audio src="{{url}}" controls="controls">'
            + 'Your computer does not support audio playback'
            + '</audio>'
        ),
        video: Y.Handlebars.compile('<video src="{{url}}"'
            + '{{#if width}}width="{{width}}" {{/if}}'
            + '{{#else}}{{#if placementAdvice.width}}width="{{width}}" {{/if}}{{/else}}'
            + '{{#if height}}height="{{height}}" {{/if}}'
            + '{{#else}}{{#if placementAdvice.height}}height="{{height}}" {{/if}}{{/else}}'
            + '></video>'
        ),
        link: Y.Handlebars.compile('<div ' 
            + 'style="'
            + 'width:{{item.displayWidth}};'
            + 'height:{{item.displayHeight}};'
            + '" >'
                + '<div style="width:{{item.displayWidth}};'
                    + 'height:{{titleHeight}};">'
                    + '<a href="/lib/editor/atto/plugins/lti/view.php?custom={{custom}}&'
                    + 'course={{course.id}}&ltitypeid={{toolid}}&resourcelinkid={{resourcelinkid}}'
                    + '{{#if item.url}}&contenturl={{item.url}}{{/if}}'
                    + '" '
                    + '{{#if item.placementAdvice.windowTarget}}target="{{item.placementAdvice.windowTarget}}" {{/if}}'
                    + '>'
                        + '{{#if item.thumbnail}}'
                        + '<img src={{item.thumbnail.id}} '
                        + 'style="float:left;margin-right:5px;'
                        + 'width:{{item.thumbnail.width}}px;'
                        + 'height:{{item.thumbnail.height}}px;'
                        + '" /> '
                        + '{{/if}}'
                        + '<div style="float:left;font-size:20px;font-weight:bold;'
                        + 'max-width:{{titleWidth}};height:{{titleHeight}};line-height:{{titleHeight}};">' 
                        + '{{item.title}}'
                        + '</div>'
                    + '</a>'
                + '</div>'
                + '{{#if item.text}}'
                + '<div style="width:{{item.displayWidth}};max-height:{{textHeight}};"></span>{{item.text}}</span></div>'
                + '{{/if}}'
            + '</div>'
        )
    };

    switch (mimeTypeType) {
        case 'application':
            if (mimeTypePieces[1] == 'vnd.ims.lti.v1.ltilink') {

                content = TEMPLATES.ltiLink({
                    item: item,
                    toolid: tool.id,
                    resourcelinkid: resourceLinkId,
                    course: course,
                });
            } 
            else {
                alert('Unrecognized application subtype');
            }
            break;
        case 'text':
            content = TEMPLATES.link({
                item: item,
                custom: encodeURIComponent(JSON.stringify(item.custom)),
                course: course,
                toolid: tool.id,
                resourcelnkid: resourceLinkId,
                textHeight: textHeight,
                titleHeight: titleHeight,
                titleWidth: titleWidth
            });
            break;
        case 'image':
            content = TEMPLATES.image({
                url: item.url,
                alt: item.title,
                width: item.width,
                height: item.height,
                presentation: true
            });
            break;
        case 'audio':
            content = TEMPLATES.audio(item);
            break;
        case 'video':
            content = TEMPLATES.video(item);
            break;
        default:
            alert('Unrecognized type');
    }

    this.toHtml = function () {
        return content;
    };

};

Y.namespace('M.atto_lti').ImageRenderingStrategy = function (item, course,
        resourceLinkId, tool) {

    var template = Y.Handlebars.compile('<img src="{{url}}" alt="{{title}}" '
            + '{{#if width}}width="{{width}}" {{/if}}'
            + '{{#if height}}height="{{height}}" {{/if}}'
            + '{{#if presentation}}role="presentation" {{/if}}'
            + '{{#if customstyle}}style="{{customstyle}}" {{/if}}'
            + '{{#if classlist}}class="{{classlist}}" {{/if}}'
            + '{{#if id}}id="{{id}}" {{/if}}' + '/>'
            );

    this.toHtml = function () {
        return template({
            item: item,
            custom: JSON.stringify(item.custom),
            courseId: course.id,
            resourcelinkid: resourceLinkId,
            ltiTypeId: tool.id
        });
    };

};

Y.namespace('M.atto_lti').IframeRenderingStrategy = function (item, course,
        resourceLinkId, tool) {

    var template;

    // If the item URL is the same as the LTI Launch URL (or Content-Item request), we assume we need
    // to make an LTI Launch request.
    if (item.url !== tool.baseurl && item.url !== tool.config.
            toolurl_ContentItemSelectionRequest) {
        item.useCustomUrl = true;
    }

    template = Y.Handlebars.compile('<iframe src="/lib/editor/atto/plugins/lti/view.php?course={{courseId}}'
            + '&ltitypeid={{ltiTypeId}}&custom={{custom}}'
            + '{{#if item.useCustomUrl}}&contenturl={{item.url}}{{/if}}'
            + '&resourcelinkid={{resourcelinkid}}" '
            + ' {{#if item.placementAdvice.displayWidth}}width="{{item.placementAdvice.displayWidth}}" {{/if}}'
            + ' {{#if item.placementAdvice.displayHeight}}height="{{item.placementAdvice.displayHeight}}" {{/if}}'
            + '></iframe>'
            );

    this.toHtml = function () {
        return template({
            item: item,
            custom: JSON.stringify(item.custom),
            courseId: course.id,
            resourcelinkid: resourceLinkId,
            ltiTypeId: tool.id
        });
    };

};

Y.namespace('M.atto_lti').PlaceholderRenderingStrategy = function (item) {

    Y.M.atto_lti.PlaceholderRenderingStrategy.superclass.constructor.apply(
            this, arguments
            );

    var placeholder, 
        PlaceholderClass, 
        action;

    if (typeof item.thumbnail !== 'undefined') {
        PlaceholderClass = Y.M.atto_lti.PreviewImagePlaceholderStrategy;
    } else if (typeof item.icon !== 'undefined') {
        PlaceholderClass = Y.M.atto_lti.IconPlaceholderStrategy;
    } else {
        PlaceholderClass = Y.M.atto_lti.TextPlaceholderStrategy;
    }

    placeholder = new PlaceholderClass(item);

    switch (item.placementAdvice.presentationDocumentTarget) {
        // NOTE: this may seem redundant for now, but it is likely we will want to
        // extend this in the future.
        case 'window':
        case 'popup':
        case 'overlay':
            action = new Y.M.atto_lti.NewWindowTargetAction(item, placeholder);
            break;
        default:
            alert('Unrecognized preesntation document target');
    }

    this.toHtml = function () {
        return action.toHtml();
    };

};

Y.namespace('M.atto_lti').PreviewImagePlaceholderStrategy = function (item) {

    Y.M.atto_lti.PreviewImagePlaceholderStrategy.superclass.constructor.call(
            this, item
            );

    var template = Y.Handlebars
            .compile('<img src="{{thumbnail[@id}}" width="{{thumbnail.width}}" '
                    + ' height="{{thumbnail.height}}" '
                    + ' alt="{{title}}" />'
                    );

    this.toHtml = function () {
        return template({
            thumnbail: item.thumbnail,
            title: item.title
        });
    };

};

Y.namespace('M.atto_lti').IconPlaceholderStrategy = function (item) {

    Y.M.atto_lti.IconPlaceholderStrategy.superclass.constructor
            .call(this, item);

    var template = Y.Handlebars
            .compile('<img src="{{icon[@id]}}" width="{{icon.width}}" '
                    + ' height="{{icon.height}}" '
                    + ' alt="{{title}}" />'
                    );

    this.toHtml = function () {
        return template({
            icon: item.icon,
            title: item.title
        });
    };

};

Y.namespace('M.atto_lti').TextPlaceholderStrategy = function (item) {
    Y.M.atto_lti.TextPlaceholderStrategy.superclass.constructor
            .call(this, item);

    this.toHtml = function () {
        if (item.text) {
            return item.text;
        } else {
            return item.title;
        }
    };
};

Y.namespace('M.atto_lti').NewWindowTargetAction = function (item, placeholder) {

    var template = Y.Handlebars
            .compile('<a href="{{item.url}}" target="_blank">{{placeholder.toHtml()}}</a>');

    this.toHtml = function () {
        return template({
            item: item,
            placeholder: placeholder
        });
    };

};
