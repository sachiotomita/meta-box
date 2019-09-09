( function ( $, rwmb ) {
	'use strict';

	/**
	 * Reorder selected values in correct order that they were selected.
	 * @param $select2 jQuery element of the select2.
	 */
	function reorderSelected( $select2 ) {
		var selected = $select2.data( 'selected' );
		if ( ! selected ) {
			return;
		}
		selected.forEach( function ( value ) {
			var option = $select2.children( '[value="' + value + '"]' );
			option.detach();
			$select2.append( option );
		} );
		$select2.trigger( 'change' );
	}

	/**
	 * Transform select fields into beautiful dropdown with select2 library.
	 */
	function transform() {
		var $this = $( this ),
			options = $this.data( 'options' );

		$this.removeClass( 'select2-hidden-accessible' );
		$this.siblings( '.select2-container' ).remove();

		if ( options.ajax_data ) {
			options.ajax.data = function( params ) {
				return Object.assign( options.ajax_data, params );
			};
			options.ajax.processResults = function ( response ) {
				var items = response.data.items.map( function( item ) {
					return {
						id: item.value,
						text: item.label,
					}
				} );

				var results = {
					results: items
				}
				if ( response.data.hasOwnProperty( 'more' ) ) {
					results.pagination = { more: true };
				}

				return results;
			};

			// Cache ajax requests: https://github.com/select2/select2/issues/110#issuecomment-419247158
			var cache = {};
			options.ajax.transport = function ( params, success, failure ) {
				if ( params.data._type === 'query' ) {
					delete params.data.page;
				}
				var key = JSON.stringify( params.data );
				if ( cache[key] ) {
					success( cache[key] );
					return;
				}

				return $.ajax( params ).then( function ( data ) {
					cache[key] = data;
					return data;
				} ).then( success ).fail( failure );
		   };
		}

		$this.show().select2( options );

		if ( ! $this.attr( 'multiple' ) ) {
			return;
		}

		reorderSelected( $this );

		/**
		 * Preserve the order that options are selected.
		 * @see https://github.com/select2/select2/issues/3106#issuecomment-255492815
		 */
		$this.on( 'select2:select', function ( event ) {
			var option = $this.children( '[value="' + event.params.data.id + '"]' );
			option.detach();
			$this.append( option ).trigger( 'change' );
		} );
	}

	function init( e ) {
		$( e.target ).find( '.rwmb-select_advanced' ).each( transform );
	}

	rwmb.$document
		.on( 'mb_ready', init )
		.on( 'clone', '.rwmb-select_advanced', transform );
} )( jQuery, rwmb );
