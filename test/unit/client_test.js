// == BSD2 LICENSE ==
// Copyright (c) 2014, Tidepool Project
//
// This program is free software; you can redistribute it and/or modify it under
// the terms of the associated License, which is identical to the BSD 2-Clause
// License as published by the Open Source Initiative at opensource.org.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
// FOR A PARTICULAR PURPOSE. See the License for more details.
//
// You should have received a copy of the License along with this program; if
// not, you can obtain one from Tidepool Project at tidepool.org.
// == BSD2 LICENSE ==

'use strict';
var expect = require('salinity').expect;

describe('armada client', function() {

  var port = 21001;
  var hostGetter = {
    get: function() { return [{ protocol: 'http', host: 'localhost:' + port }]; }
  };

  var client = require('../../lib/client')(hostGetter);

  var server = require('restify').createServer({ name: 'test' });
  var handler = null;

  before(function(done){
    var theFn = function (req, res, next) {
      handler(req, res, next);
    };
    server.get(/.*/, theFn);
    server.post(/.*/, theFn);
    server.put(/.*/, theFn);
    server.del(/.*/, theFn);
    server.on('uncaughtException', function(req, res, route, err){
      throw err;
    });
    server.listen(port, function(err){
      done();
    });
  });

  after(function(){
    server.close();
  });

  beforeEach(function(){
    handler = null;
  });

  describe('getMembersOfGroup', function() {

    it('members of a group', function(done) {

      var returnGroup =
      {
        members : ['1','2','3','6']
      };

      handler = function(req, res, next) {
        expect(req.path()).equals('/groupId/members');
        expect(req.method).equals('GET');
        expect(req.headers).to.have.property('x-tidepool-session-token').that.equals('1234');
        res.send(200,returnGroup);
        next();
      };
      client.getMembersOfGroup('groupId', '1234', function(err, res){
        expect(err).to.not.exist;
        expect(res).to.exist;
        expect(res).to.deep.equal(returnGroup);
        done();
      });

    });

  });

  describe('getGroupsAMemberOf', function() {

    it('returns the groups user is a member of', function(done) {

      var returnGroups = [
        {
          id:'7234',
          members : ['1','2','3','6']
        },
        {
          id:'4456',
          members : ['1','2']
        }
      ];

      handler = function(req, res, next) {
        expect(req.path()).equals('/membership/userId/member');
        expect(req.method).equals('GET');
        expect(req.headers).to.have.property('x-tidepool-session-token').that.equals('1234');
        res.send(200,returnGroups);
        next();
      };
      client.getGroupsAMemberOf('userId', '1234', function(err, res){
        expect(err).to.not.exist;
        expect(res).to.exist;
        expect(res).to.deep.equal(returnGroups);
        done();
      });

    });

  });

});
